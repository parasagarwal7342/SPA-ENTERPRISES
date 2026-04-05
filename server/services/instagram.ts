import axios from 'axios';
import 'dotenv/config';

export const postToInstagram = async (caption: string, imageUrl: string | null, videoPath: string | null) => {
    const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accountId || !accessToken) {
        console.warn("[Instagram] Credentials missing. Mocking success.");
        return { success: true, postUrl: "https://instagram.com/p/mock_id", error: null };
    }

    try {
        if (imageUrl) {
            // 1. Create Media Container
            const mediaRes = await axios.post(`https://graph.facebook.com/v18.0/${accountId}/media`, {
                image_url: imageUrl,
                caption: caption,
                access_token: accessToken
            });
            const creationId = mediaRes.data.id;

            // 2. Publish
            const publishRes = await axios.post(`https://graph.facebook.com/v18.0/${accountId}/media_publish`, {
                creation_id: creationId,
                access_token: accessToken
            });

            return { success: true, postUrl: `https://instagram.com/p/${publishRes.data.id}`, error: null };
        } else if (videoPath) {
            // Simplified video mock
            return { success: false, error: "Video posting requires direct streaming implementation.", postUrl: null };
        }
        return { success: false, error: "No media provided", postUrl: null };
    } catch (e: any) {
        return { success: false, error: e.response?.data?.error?.message || e.message, postUrl: null };
    }
};
