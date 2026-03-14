import express from 'express';
import dotenv from 'dotenv';
import { testConnection as testPostgres } from './config/postgres.ts';
import { TicketModel } from './models/ticket.model.ts';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// simple routes - have to move these later
app.post('/ticket', async (req, res) => {
  try {
    const ticket = await TicketModel.insert(req.body);
    res.status(200).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

app.get('/', async (req, res) => {
  try {
    const tickets = await TicketModel.findAll();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

app.get('/tickets/:id', async (req, res) => {
  try {
    const ticket = await TicketModel.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

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
