import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { db } from './sqlite.js';
import { generateContent } from './services/claude.js';
import { generateImage } from './services/dalle.js';
import { postToInstagram } from './services/instagram.js';
import { postToFacebook } from './services/facebook.js';
import { postToLinkedIn } from './services/linkedin.js';
import { postToYouTube } from './services/youtube.js';

import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
const pump = promisify(pipeline);

export const autoPostPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    console.log('[SPA ENTERPRISE] AutoPost Plugin Node Initializing...');

    fastify.post('/api/autopost/upload', async (request, reply) => {
        const data = await request.file();
        if (!data) throw new Error("No file uploaded");
        
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
        
        const filePath = path.join(uploadsDir, data.filename);
        await pump(data.file, fs.createWriteStream(filePath));
        
        return { filePath };
    });

    // Simple Password Protection Middleware
    fastify.addHook('onRequest', async (request, reply) => {
        // Only protect /api/autopost routes
        if (!request.url.startsWith('/api/autopost')) return;
        
        const pwd = request.headers['x-app-password'];
        const envPwd = process.env.APP_PASSWORD || 'mypassword123';
        if (pwd !== envPwd) {
            reply.status(401).send({ error: "Unauthorized access to MyAutoPost Node. Password required." });
        }
    });

    fastify.post('/api/autopost/generate', async (request, reply) => {
        const { topic, brand, tone, audience, platforms, generateImage: genImg } = request.body as any;
        
        const result = await generateContent({ topic, brand, tone, audience, platforms });
        
        let imageUrl = null;
        if (genImg) {
            imageUrl = await generateImage(result.imagePrompt);
        }

        return {
            ...result,
            imageUrl
        };
    });

    fastify.post('/api/autopost/post', async (request, reply) => {
        const { platforms, caption, hashtags, imageUrl, videoPath, scheduleTime } = request.body as any;

        const pforms = JSON.stringify(platforms);
        const tags = JSON.stringify(hashtags);

        if (scheduleTime) {
            db.prepare(`INSERT INTO scheduled_posts (platforms, caption, hashtags, image_url, video_path, scheduled_time) VALUES (?, ?, ?, ?, ?, ?)`).run(
                pforms, caption, tags, imageUrl, videoPath, scheduleTime
            );
            return { message: "Post Scheduled Successfully" };
        }

        // Post immediately
        const results: any = {};
        let overallSuccess = true;

        if (platforms.includes('instagram')) {
            results.instagram = await postToInstagram(caption, imageUrl, videoPath);
            if (!results.instagram.success) overallSuccess = false;
        }
        if (platforms.includes('facebook')) {
            results.facebook = await postToFacebook(caption, imageUrl);
            if (!results.facebook.success) overallSuccess = false;
        }
        if (platforms.includes('linkedin')) {
            results.linkedin = await postToLinkedIn(caption);
            if (!results.linkedin.success) overallSuccess = false;
        }
        if (platforms.includes('youtube') && videoPath) {
            results.youtube = await postToYouTube(videoPath, 'Generated Title', caption);
            if (!results.youtube.success) overallSuccess = false;
        }

        db.prepare(`INSERT INTO posts (topic, brand, tone, platforms, captions, hashtags, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
            'Manual Context', 'SPA', 'Mixed', pforms, caption, tags, imageUrl, overallSuccess ? 'posted' : 'failed'
        );

        return { results };
    });

    fastify.get('/api/autopost/history', async (request, reply) => {
        const rows = db.prepare(`SELECT * FROM posts ORDER BY created_at DESC`).all();
        return rows;
    });

    fastify.get('/api/autopost/scheduled', async (request, reply) => {
        const rows = db.prepare(`SELECT * FROM scheduled_posts ORDER BY scheduled_time ASC`).all();
        return rows;
    });

    fastify.delete('/api/autopost/scheduled/:id', async (request, reply) => {
        const { id } = request.params as any;
        db.prepare(`DELETE FROM scheduled_posts WHERE id = ?`).run(id);
        return { success: true };
    });
};
