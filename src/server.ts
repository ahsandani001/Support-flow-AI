import express from 'express';
import dotenv from 'dotenv';
import { testConnection as testPostgres } from './config/postgres.ts';
import { connectMongoDB } from './config/mongodb.ts';
import { connectRedis } from './config/redis.ts';
import ticketRoutes from './routes/ticket.routes.ts';
import messageRoutes from './routes/message.routes.ts';
import authRoutes from './routes/auth.routes.ts';
import userRoutes from './routes/user.routes.ts';
import { MigrationRunner } from './migrations/runner.ts';
import { authenticate } from './middleware/auth.middleware.ts'; // Add this

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tickets', ticketRoutes);
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

    // Run migration after connecting DB
    await MigrationRunner.runMigrations();
  } catch (err) {
    console.log('❌ Failed to start server:', err);
    process.exit(1); //Exits if DB connection fails
  }
  // start server
  app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });
}

startServer();
