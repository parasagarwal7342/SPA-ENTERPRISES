import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const resizeImage = async (inputPath: string, platform: 'instagram_square' | 'instagram_story' | 'facebook' | 'linkedin' | 'youtube_thumb') => {
    const dimensions = {
        instagram_square: { width: 1080, height: 1080 },
        instagram_story: { width: 1080, height: 1920 },
        facebook: { width: 1200, height: 630 },
        linkedin: { width: 1200, height: 627 },
        youtube_thumb: { width: 1280, height: 720 },
    };

    const target = dimensions[platform];
    const outDir = path.join(__dirname, '..', '..', 'uploads', platform);
    
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const outputPath = path.join(outDir, path.basename(inputPath));
    
    await sharp(inputPath)
        .resize(target.width, target.height, { fit: 'cover' })
        .toFile(outputPath);

    return outputPath;
};
