import Anthropic from '@anthropic-ai/sdk';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db, toProduct, type ProductRow } from '../db.js';
import { rateLimit } from '../auth.js';
import { SHIPPING_RULES } from '../pricing.js';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(1500),
  })).min(1).max(20),
});

function catalogSummary() {
  const rows = (db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY brand, category, price').all() as ProductRow[]).map(toProduct);
  return rows.map((p) => `- [${p.id}] ${p.name} | ${p.brand} | ${p.category} | ₹${p.price}${p.mrp ? ` (MRP ₹${p.mrp})` : ''}${p.stock === 0 ? ' | OUT OF STOCK' : ''}`).join('\n');
}

function systemPrompt() {
  const s = SHIPPING_RULES;
  return `You are Shraddha AI, the shopping assistant on the SPA Enterprises website (spaenterprise.in).
SPA Enterprises, Rohini Sector-39, Delhi, is an authorised distributor of National Geographic bags and luggage and Shraddha brass jewellery.

Help visitors pick products, compare options, and understand prices, shipping and ordering. Keep answers short (2-5 sentences or a short list), friendly and in the visitor's language (English or Hindi/Hinglish).
Only recommend products from the catalog below and always quote their exact listed price. Mention the product code in square brackets so the visitor can find it, e.g. [N20902.06].
If something is not in the catalog, or you are unsure about a policy, say so and suggest WhatsApp or phone: +91 93122 77087, or email spaenterprisesdelhi@gmail.com.
For orders of 10 or more units, corporate gifting or dealership, suggest the "Bulk / B2B quote" form on the website.
Shipping: Delhi/NCR ₹${s.delhi.fee}; rest of India ₹${s.india.fee}, free above ₹${s.india.freeAbove}; international ₹${s.global.fee}. Payment by UPI/cards/net banking (Razorpay) or Cash on Delivery within India, where available. Shraddha jewellery carries a 1-year coating warranty.
Never invent discounts, delivery dates or stock counts.

CATALOG:
${catalogSummary()}`;
}

const FALLBACK = 'Our assistant is unavailable right now. Please WhatsApp or call us at +91 93122 77087 and our team will help you.';

export const aiRoutes: FastifyPluginAsync = async (app) => {
  app.post('/api/ai/chat', async (req, reply) => {
    if (!rateLimit(`ai:${req.ip}`, 30, 60 * 60 * 1000)) {
      return reply.status(429).send({ reply: 'You have sent a lot of messages. Please WhatsApp us at +91 93122 77087 for more help.' });
    }
    const { messages } = chatSchema.parse(req.body);
    if (messages[messages.length - 1].role !== 'user') return reply.status(400).send({ error: 'Last message must be from the user.' });
    if (!process.env.ANTHROPIC_API_KEY) return { reply: FALLBACK };

    const client = new Anthropic();
    try {
      const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 2000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'low' },
        cache_control: { type: 'ephemeral' },
        system: systemPrompt(),
        messages,
      });
      if (response.stop_reason === 'refusal') return { reply: FALLBACK };
      const text = response.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('\n').trim();
      return { reply: text || FALLBACK };
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        req.log.warn('Claude rate limited');
      } else if (error instanceof Anthropic.APIError) {
        req.log.error({ status: error.status, message: error.message }, 'Claude API error');
      } else {
        req.log.error(error, 'Claude request failed');
      }
      return { reply: FALLBACK };
    }
  });
};
