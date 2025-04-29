const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const config = require('./config');

const app = express();
app.use(express.json());

const pool = new Pool(config.DB_CONFIG);

// Authentication middleware
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== config.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Store interaction with metadata
async function storeInteraction(question, answer, metadata = {}) {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO interactions (question, answer, metadata) VALUES ($1, $2, $3)',
      [question, answer, JSON.stringify(metadata)]
    );
  } finally {
    client.release();
  }
}

// Get filtered history
async function getHistory(metadataFilter = {}) {
  const client = await pool.connect();
  try {
    const query = {
      text: `SELECT question, answer, created_at, metadata 
             FROM interactions 
             WHERE metadata @> $1
             ORDER BY created_at DESC 
             LIMIT 10`,
      values: [JSON.stringify(metadataFilter)]
    };
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

// Enhanced AI response with error handling
async function getAIResponse(question, context) {
  try {
    const prompt = `Context: ${context}\n\nQuestion: ${question}\nAnswer:`;
    
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/google/flan-t5-xxl',
      { inputs: prompt },
      { 
        headers: { Authorization: `Bearer ${config.HF_API_KEY}` },
        timeout: 30000 
      }
    );

    return response.data[0]?.generated_text || "I don't know the answer to that.";
  } catch (error) {
    console.error('Hugging Face Error:', error.response?.data || error.message);
    return "I'm having trouble answering that right now.";
  }
}

// Updated endpoints
app.post('/ask', async (req, res) => {
  try {
    const { question, metadata = {} } = req.body;
    const history = await getHistory(metadata);
    const context = history.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n');
    
    const answer = await getAIResponse(question, context);
    await storeInteraction(question, answer, metadata);

    res.json({ question, answer, metadata });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'AI service error', details: error.message });
  }
});

app.get('/history', async (req, res) => {
  try {
    const metadataFilter = req.query.metadata ? JSON.parse(req.query.metadata) : {};
    const history = await getHistory(metadataFilter);
    res.json(history);
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Database initialization
async function initializeDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS interactions (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_interactions_created_at 
    ON interactions (created_at)
  `);
}

app.listen(config.PORT, async () => {
  await initializeDb();
  console.log(`AI service running on port ${config.PORT}`);
});