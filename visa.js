export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    res.status(200).json({ result: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
