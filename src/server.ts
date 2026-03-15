import express from 'express';
import dotenv from 'dotenv';
import { testConnection as testPostgres } from './config/postgres.ts';
import { TicketModel } from './models/ticket.model.ts';
import ticketRoutes from './routes/ticket.routes.ts';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use(ticketRoutes);

// initialize DB and start server
async function startServer() {
  try {
    // test postgres connection
    await testPostgres();

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
