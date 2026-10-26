# SPA Enterprise – Online Store & Back Office

Website for **SPA Enterprises, Delhi**, authorised distributor of National Geographic bags/luggage and Shraddha Arts & Jewels.
Live at **https://spaenterprise.in**.

| Part | Folder | Hosting |
|---|---|---|
| Storefront + dashboards (React 19, Vite, Tailwind) | `/` | Vercel |
| API (Fastify, TypeScript, SQLite) | `/server` | Railway |

## What it does

**For customers**
- Shop with search, brand/category filters, sorting and real stock status; every product has its own shareable URL (`/products/N20902.06`).
- Cart with quantities (kept in the browser), guest checkout, Razorpay (UPI/cards/net banking) or Cash on Delivery, coupon codes.
- Order tracking by order number + phone/email (`/track`), order history for signed-in customers (`/account`).
- Bulk / corporate / dealer quote form (`/bulk-order`), contact form, warranty claims (`/warranty`), WhatsApp button, AI shopping assistant.
- Store policies page (`/policies`) – required by Razorpay before going live.

**For staff** (`/staff`)
- Order desk: filter by status, update status, add courier tracking, mark COD cash collected, one-tap WhatsApp/call to the customer.
- Products & stock: add/edit/hide products, inline stock edits, low-stock alerts.
- Leads: every bulk/dealer/contact/support enquiry with status pipeline and notes.
- Social posts: AI-generated captions and posting to Instagram/Facebook/LinkedIn/YouTube.

**For the owner** (`/owner`)
- Revenue, orders, average order value, repeat-customer rate (vs previous period), daily revenue, best sellers, brand and payment split, COD to collect, unfinished checkouts, leads pipeline.
- Add/remove staff logins, create discount coupons.

## Security model
- Passwords are hashed (scrypt); sign-in returns a signed token valid for 7 days.
- Every write endpoint checks the role on the server (customer / seller / owner).
- Prices, discounts and shipping are always calculated on the server; payment signatures and the Razorpay webhook are verified.
- There are **no default passwords**. The owner account comes from `OWNER_EMAIL` / `OWNER_PASSWORD`; the owner adds staff from the dashboard.

## Local development

Requires Node.js 20+.

```bash
npm install
cd server && npm install && cp .env.example .env   # set OWNER_EMAIL / OWNER_PASSWORD at least
```

```bash
# Terminal 1 – API on http://localhost:5000
cd server && npm run dev

# Terminal 2 – website on http://localhost:3000
VITE_API_URL=http://localhost:5000 npm run dev
```

On first start the API creates `server/data/spa.db` and loads the 43-product catalogue (or the products from an old `server/db.json`, if one exists).

## Deploying

### API → Railway
1. Service root directory: `server`. Build command `npm install && npm run build`, start command `npm start`.
2. **Add a Volume** mounted at `/data` and set `DATA_DIR=/data`. Without it, orders and products are lost on every redeploy.
3. Set the variables from `server/.env.example`. Minimum: `NODE_ENV=production`, `JWT_SECRET`, `OWNER_EMAIL`, `OWNER_PASSWORD`, `DATA_DIR`, `CORS_ORIGINS`.
4. Online payments: add `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`, then create a webhook in Razorpay pointing to `https://<api-domain>/api/payment/webhook` (events `payment.captured`, `order.paid`) and set `RAZORPAY_WEBHOOK_SECRET`.
5. Optional: `ANTHROPIC_API_KEY` (shopping assistant), `NOTIFY_WEBHOOK_URL` (Slack/Discord alert for every order and lead).

### Website → Vercel
1. Framework preset Vite, root `/`.
2. Environment variable `VITE_API_URL` = the Railway API URL (no `/api` suffix). The default is `https://spa-enterprises-production.up.railway.app`.
3. If the API URL changes, also update the `/sitemap.xml` rewrite in `vercel.json`.

## API overview

| Area | Endpoints |
|---|---|
| Public | `GET /api/products`, `GET /api/products/:id`, `GET /api/config`, `POST /api/orders/quote`, `POST /api/orders`, `POST /api/orders/:no/verify-payment`, `GET /api/orders/track`, `POST /api/inquiries`, `POST /api/ai/chat`, `GET /api/sitemap.xml` |
| Signed in | `GET /api/auth/me`, `GET /api/orders/mine`, `POST /api/auth/change-password` |
| Staff | product create/edit/delete/stock, `/api/staff/orders`, `/api/staff/inquiries`, `/api/staff/summary`, `/api/autopost/*` |
| Owner | `/api/staff/analytics`, `/api/staff/team`, `/api/staff/coupons` |

## Contact
spaenterprisesdelhi@gmail.com · +91 93122 77087 · 53-B, Block-C, Gali No. 1, Karala, Rama Vihar, Delhi – 110081

Built and maintained for SPA Enterprises by [Paravion Tech](https://portfolio-a6ccb.web.app/).
