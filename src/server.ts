import express from 'express';
import dotenv from 'dotenv';
import { testConnection as testPostgres } from './config/postgres.ts';
import { connectMongoDB } from './config/mongodb.ts';
import { connectRedis } from './config/redis.ts';
import { TicketModel } from './models/ticket.model.ts';
import ticketRoutes from './routes/ticket.routes.ts';
import messageRoutes from './routes/message.routes.ts';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use(ticketRoutes);
app.use(messageRoutes);

// initialize DB and start server
async function startServer() {
  try {
    // test postgres connection
    await testPostgres();

    // test mongoDB connection
    await connectMongoDB();

    // test redis connection
    await connectRedis();

    // Create ticket table in postgres
    await TicketModel.createTable();
  } catch (err) {
    console.log('❌ Failed to start server:', err);
  }
  // start server
  app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });
}

startServer();
