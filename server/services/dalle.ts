import OpenAI from 'openai';
import 'dotenv/config';

export const generateImage = async (prompt: string): Promise<string | null> => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.log("[DALL-E] No API Key provided, skipping image generation.");
        return null;
    }

    try {
        const openai = new OpenAI({ apiKey });
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });

        return response.data[0].url || null;
    } catch (error) {
        console.error("DALL-E error:", error);
        return null;
    }
};
