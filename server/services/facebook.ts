import axios from 'axios';
import 'dotenv/config';

export const postToFacebook = async (caption: string, imageUrl: string | null) => {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    if (!pageId || !accessToken) {
        console.warn("[Facebook] Credentials missing. Mocking success.");
        return { success: true, postUrl: "https://facebook.com/mock_post", error: null };
    }

    try {
        if (imageUrl) {
            const res = await axios.post(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
                url: imageUrl,
                message: caption,
                access_token: accessToken
            });
            return { success: true, postUrl: `https://facebook.com/${res.data.id}`, error: null };
        } else {
            const res = await axios.post(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
                message: caption,
                access_token: accessToken
            });
            return { success: true, postUrl: `https://facebook.com/${res.data.id}`, error: null };
        }
    } catch (e: any) {
        return { success: false, error: e.response?.data?.error?.message || e.message, postUrl: null };
    }
};
