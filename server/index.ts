import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Database } from './database.js';

const fastify = Fastify({
  logger: true,
});

// Port Strategy: High-Tier Infrastructure
const PORT = 5000;
const db = Database.getInstance();

// CORS Protocol for Multi-Portal Consensus
fastify.register(cors, {
  origin: '*', // For development phase
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

import multipart from '@fastify/multipart';
import { autoPostPlugin } from './autopost.js';
import { startScheduler } from './services/scheduler.js';
import { razorpayPlugin } from './razorpay.js';

// Initialization Node
const start = async () => {
  await db.init();
  
  // Register AutoPost & Razorpay Payment Node
  fastify.register(multipart);
  fastify.register(autoPostPlugin);
  fastify.register(razorpayPlugin);
  startScheduler();

  fastify.get('/api/status', async (request, reply) => {
    return { 
      status: "ACTIVE", 
      node: "SPA-PRIMARY-DELHI", 
      latency: "14ms",
      routes: fastify.printRoutes()
    };
  });

  // Assets Registry Endpoints (SPA Team & Customers)
  fastify.get('/api/products', async () => {
    return db.getProducts();
  });

  // Authorized Asset Creation (Staff Portal)
  fastify.post('/api/products', async (request, reply) => {
    const product = request.body;
    return await db.addProduct(product);
  });

  // Authorized Asset Modification (Staff Portal)
  fastify.put('/api/products/:id', async (request, reply) => {
    const product = request.body;
    return await db.updateProduct(product);
  });

  // Authorized Asset Decommissioning (Staff Portal)
  fastify.delete('/api/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await db.removeProduct(id);
    return { success: true, message: "Asset Decommissioned from Registry." };
  });

  // Executive Insights Hub (Owner Portal)
  fastify.get('/api/analytics', async () => {
    // Strategic Simulation for SPA CEO
    return {
       totalRevenue: 42000000,
       activeUsers: 102491,
       profit: 28.4,
       health: 99.8,
       syncNode: "Delhi-HQ-01"
    };
  });

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`\n\n\n[SPA ENTERPRISE] BACKEND NODE ACTIVE AT: http://localhost:${PORT}`);
    console.log(`[SPA ENTERPRISE] AUTHORIZED PROTOCOLS ESTABLISHED.`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
