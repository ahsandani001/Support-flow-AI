import { query } from './config/postgres.ts';
import { TicketModel } from './models/ticket.model.ts';

async function getEmbedding(text: string): Promise<number[]> {
  // Call Ollama API (running locally)
  const response = await fetch('http://localhost:11434/api/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      input: text,
      dimensions: 384,
    }),
  });

  const data = await response.json();
  return data.embeddings; // Array of 384 numbers
}

async function generateRealEmbeddings() {
  const tickets = await TicketModel.findAll();

  for (const ticket of tickets.rows) {
    const text = `${ticket.title} ${ticket.description}`;
    const embedding = await getEmbedding(text);

    await query(
      `INSERT INTO ticket_embeddings (ticket_id, embedding)
       VALUES ($1, $2::vector)
       ON CONFLICT (ticket_id) DO UPDATE SET embedding = $2::vector`,
      [ticket.id, JSON.stringify(embedding[0])],
    );

    console.log(`✅ Embedded ticket ${ticket.id}`);
  }
}

generateRealEmbeddings();
