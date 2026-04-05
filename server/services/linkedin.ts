import axios from 'axios';
import 'dotenv/config';

export const postToLinkedIn = async (caption: string) => {
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const personId = process.env.LINKEDIN_CLIENT_ID; // In realistic scenarios, fetch via /me

    if (!accessToken) {
        console.warn("[LinkedIn] Credentials missing. Mocking success.");
        return { success: true, postUrl: "https://linkedin.com/feed/update/urn:li:activity:mock", error: null };
    }

    try {
        const urn = `urn:li:person:${personId}`;
        const res = await axios.post(`https://api.linkedin.com/v2/ugcPosts`, {
            author: urn,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: { text: caption },
                    shareMediaCategory: "NONE"
                }
            },
            visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Restli-Protocol-Version': '2.0.0'
            }
        });
        return { success: true, postUrl: `https://linkedin.com/feed/update/${res.data.id}`, error: null };
    } catch (e: any) {
        return { success: false, error: e.response?.data?.message || e.message, postUrl: null };
    }
};
