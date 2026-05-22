 const express = require('express');
 const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/visa', async (req, res) => {
  const { from, to, purpose } = req.body;
  const prompt = `You are a visa expert. A ${from} passport holder wants to travel to ${to} for ${purpose} in 2025-2026. Give accurate visa information using exactly these section headers:
VISA STATUS: [Visa-Free / Visa on Arrival / eVisa Required / Visa Required]
ALLOWED STAY: [duration]
REQUIREMENTS: [key documents]
HOW TO APPLY: [process]
COST: [fees]
PROCESSING TIME: [how long]
PROHIBITED MEDICATIONS: [list medications banned in ${to}]
IMPORTANT NOTES: [key warnings]
Be concise and accurate.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
    res.json({ result: text });
  } catch(e) {
    res.status(500).json({ error: 'Failed to fetch visa info' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
