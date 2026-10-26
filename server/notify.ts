import type { FastifyBaseLogger } from 'fastify';

// Optional instant alert for new orders and leads. Point NOTIFY_WEBHOOK_URL at a
// Slack or Discord incoming webhook (both accept this payload). Never blocks the request.
export function notifyBusiness(text: string, log: FastifyBaseLogger) {
  const url = process.env.NOTIFY_WEBHOOK_URL;
  log.info({ alert: text }, 'business alert');
  if (!url) return;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, content: text }),
    signal: AbortSignal.timeout(5000),
  }).catch((e) => log.warn(e, 'notify webhook failed'));
}
