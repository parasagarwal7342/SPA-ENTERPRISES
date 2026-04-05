import cron from 'node-cron';
import { db } from '../sqlite.js';
import { postToInstagram } from './instagram.js';
import { postToFacebook } from './facebook.js';
import { postToLinkedIn } from './linkedin.js';
import { postToYouTube } from './youtube.js';

export const startScheduler = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date().toISOString();
        
        const pending = db.prepare(`SELECT * FROM scheduled_posts WHERE status = 'pending' AND scheduled_time <= ?`).all(now) as any[];
        
        for (const post of pending) {
            console.log(`[Scheduler] Processing scheduled post ID: ${post.id}`);
            
            const platforms = JSON.parse(post.platforms);
            const captions = JSON.parse(post.caption); // assumes caption stores the multiple captions
            let overallSuccess = true;
            let errors = [];

            try {
                if (platforms.includes('instagram')) {
                    const res = await postToInstagram(captions.instagram, post.image_url, post.video_path);
                    if (!res.success) { overallSuccess = false; errors.push(`IG: ${res.error}`); }
                }
                if (platforms.includes('facebook')) {
                    const res = await postToFacebook(captions.facebook, post.image_url);
                    if (!res.success) { overallSuccess = false; errors.push(`FB: ${res.error}`); }
                }
                if (platforms.includes('linkedin')) {
                    const res = await postToLinkedIn(captions.linkedin);
                    if (!res.success) { overallSuccess = false; errors.push(`LI: ${res.error}`); }
                }
                if (platforms.includes('youtube')) {
                    const res = await postToYouTube(post.video_path || '', 'Generated Video', captions.youtube);
                    if (!res.success) { overallSuccess = false; errors.push(`YT: ${res.error}`); }
                }

                if (overallSuccess) {
                    db.prepare(`UPDATE scheduled_posts SET status = 'posted' WHERE id = ?`).run(post.id);
                } else {
                    db.prepare(`UPDATE scheduled_posts SET status = 'failed', error = ? WHERE id = ?`).run(errors.join(' | '), post.id);
                }
            } catch (e: any) {
                db.prepare(`UPDATE scheduled_posts SET status = 'failed', error = ? WHERE id = ?`).run(e.message, post.id);
            }
        }
    });

    console.log('[SPA ENTERPRISE] AutoPost Scheduler Initialized.');
};
