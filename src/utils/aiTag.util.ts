// import {query} from '../config/postgres.ts'

export async function generateTags(
  ticketTitle: string,
  ticketDescription: string,
): Promise<string[]> {
  const prompt = `
    Analyze this support ticket and suggest 3-5 relevant tags/categories.
    Tags should be lowercase, use hyphens for multiple words.
    Return ONLY a JSON array of strings, nothing else.
    
    Title: ${ticketTitle}
    Description: ${ticketDescription}
    
    Example tags: ["login", "billing", "technical-issue", "feature-request", "account-access"]
  `;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3, // Lower = more consistent, less creative
        },
      }),
    });

    const data = await response.json();
    // Parse the JSON array from response
    const tags = JSON.parse(data.response);
    return Array.isArray(tags) ? tags.slice(0, 5) : [];
  } catch (error) {
    console.error('Error generating tags:', error);
    return []; // Fallback: no tags
  }
}
