import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

export const generateContent = async (params: { topic: string, brand: string, tone: string, audience: string, platforms: string[] }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        // Return Mock Data for UI testing mode as required by prompt
        return {
            captions: {
                instagram: `🔥 Unleash your potential with ${params.brand}! This ${params.topic} is exactly what you need. #lifestyle`,
                facebook: `Hey friends! We just rolled out ${params.topic} for ${params.brand}. Perfect for ${params.audience || 'everyone'}. Let me know your thoughts!`,
                youtube: `In this video, we cover ${params.topic} from ${params.brand}. Subscribe for more value.`,
                linkedin: `I am excited to share that ${params.brand} is venturing into ${params.topic}. A great milestone for us.`
            },
            hashtags: ['#innovation', '#tech', '#growth', '#business'],
            script: `[0:00] Hook: Are you ready for ${params.topic}?\n[0:15] Main: We built ${params.brand} for you.\n[0:45] CTA: Click the link below!`,
            imagePrompt: `A vibrant, highly detailed representation of ${params.topic} in a professional ${params.tone} theme.`,
        };
    }

    const anthropic = new Anthropic({ apiKey });

    const prompt = `
Generate engaging social media content.
Topic: ${params.topic}
Brand/Name: ${params.brand}
Tone: ${params.tone}
Target Audience: ${params.audience || 'general'}
Platforms requested: ${params.platforms.join(', ')}

Return ONLY a structured JSON object with NO markdown wrapping. The JSON must have these exact keys:
- instagramCaption (string)
- facebookCaption (string)
- youtubeCaption (string)
- linkedinCaption (string)
- hashtags (array of strings)
- script (string, a 60-second video script: Hook -> Main -> CTA)
- imagePrompt (string, visual prompt for DALL-E)
`;

    const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        temperature: 0.7,
        system: "You are a professional social media content creator. Generate engaging, platform-optimized content. Return structured JSON response only — no markdown, no extra text.",
        messages: [{ role: 'user', content: prompt }]
    });

    const val = (response.content[0] as any).text;
    try {
        const parsed = JSON.parse(val);
        return {
            captions: {
                instagram: parsed.instagramCaption || '',
                facebook: parsed.facebookCaption || '',
                youtube: parsed.youtubeCaption || '',
                linkedin: parsed.linkedinCaption || ''
            },
            hashtags: parsed.hashtags || [],
            script: parsed.script || '',
            imagePrompt: parsed.imagePrompt || ''
        };
    } catch (e) {
        throw new Error("Failed to parse Claude JSON output");
    }
};
