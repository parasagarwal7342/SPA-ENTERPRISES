import Razorpay from 'razorpay';
import crypto from 'crypto';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import 'dotenv/config';

export const razorpayPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {

    // POST /api/payment/create-order
    // Called when customer clicks "Pay Now". Creates a Razorpay order and returns the order_id.
    fastify.post('/api/payment/create-order', async (request, reply) => {
        const { amount, currency = 'INR', receipt } = request.body as any;

        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        // If no Razorpay credentials, return a mock response for testing
        if (!keyId || !keySecret) {
            console.warn('[Razorpay] No credentials. Returning mock order for UI testing.');
            return {
                id: `mock_order_${Date.now()}`,
                amount: amount,
                currency: currency,
                status: 'created',
                mock: true
            };
        }

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

        const orderOptions = {
            amount: amount * 100, // Razorpay expects paise (1 INR = 100 paise)
            currency,
            receipt: receipt || `order_spa_${Date.now()}`,
        };

        try {
            const order = await razorpay.orders.create(orderOptions);
            return order;
        } catch (error: any) {
            reply.status(500).send({ error: 'Failed to create Razorpay order', details: error.message });
        }
    });

    // POST /api/payment/verify
    // Called after payment success to verify webhook signature — prevents fraud.
    fastify.post('/api/payment/verify', async (request, reply) => {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.body as any;
        const keySecret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret';

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body)
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            return { verified: true, payment_id: razorpay_payment_id };
        } else {
            reply.status(400).send({ verified: false, error: 'Signature mismatch — payment not verified' });
        }
    });
};
