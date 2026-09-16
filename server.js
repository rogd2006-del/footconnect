import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);

const turfs = [
  { id: 'andheri-arena', name: 'Andheri Football Arena', distance: 1.8, address: 'Andheri West', rating: 4.8, price: 1800, hours: '06:00 - 01:00', image: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=900&q=80', slots: ['7:00 PM', '9:00 PM'] },
  { id: 'kicksters', name: 'Kicksters Turf', distance: 3.2, address: 'Jogeshwari', rating: 4.6, price: 1500, hours: '07:00 - 00:00', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80', slots: ['6:30 PM', '7:30 PM'] },
  { id: 'playmax', name: 'PlayMax Sports Club', distance: 4.6, address: 'Vile Parle', rating: 4.7, price: 2100, hours: '06:00 - 23:00', image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=900&q=80', slots: ['6:00 PM', '8:00 PM'] }
];

let games = [
  { id: 'andheri', turfId: 'andheri-arena', turf: turfs[0].name, startsAt: 'Tonight, 9:00 PM', format: '7v7', skill: 'Intermediate', joined: 7, capacity: 10, distance: 1.8, status: 'open' },
  { id: 'kicksters-game', turfId: 'kicksters', turf: turfs[1].name, startsAt: 'Tomorrow, 7:30 PM', format: '5v5', skill: 'Beginner', joined: 3, capacity: 5, distance: 3.2, status: 'open' },
  { id: 'playmax-game', turfId: 'playmax', turf: turfs[2].name, startsAt: 'Sat, 6:00 PM', format: '7v7', skill: 'Advanced', joined: 13, capacity: 14, distance: 4.6, status: 'open' }
];

app.use(express.json({ limit: '32kb' }));
app.use(express.static(__dirname));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'footconnect-api' }));
app.get('/api/turfs', (_req, res) => res.json({ data: turfs }));
app.get('/api/games', (_req, res) => res.json({ data: games.filter(game => game.joined < game.capacity) }));

app.post('/api/games', (req, res) => {
  const { turfId, startsAt, format = '5v5', skill = 'Intermediate', capacity = 10, joined = 1 } = req.body || {};
  const turf = turfs.find(item => item.id === turfId) || turfs[0];
  if (!startsAt || !Number.isInteger(Number(capacity)) || Number(capacity) < 2) return res.status(400).json({ error: 'Choose a start time and a valid capacity.' });
  const game = { id: crypto.randomUUID(), turfId: turf.id, turf: turf.name, startsAt, format, skill, joined: Math.min(Number(joined), Number(capacity)), capacity: Number(capacity), distance: turf.distance, status: 'open' };
  games = [game, ...games];
  res.status(201).json({ data: game });
});

app.post('/api/games/:id/join', (req, res) => {
  const game = games.find(item => item.id === req.params.id);
  if (!game) return res.status(404).json({ error: 'Game not found.' });
  if (game.joined >= game.capacity) return res.status(409).json({ error: 'This game is full.' });
  game.joined += 1;
  if (game.joined === game.capacity) game.status = 'full';
  res.json({ data: game });
});

app.post('/api/recommendations', async (req, res) => {
  const { position = 'Midfielder', skill = 'Intermediate', preferredTime = 'evenings' } = req.body || {};
  if (!process.env.GEMINI_API_KEY) return res.json({ data: { text: 'Try an evening 7v7 at Andheri Football Arena. It matches your position and skill level.' }, fallback: true });
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `You are a concise football match concierge. Recommend one type of local game for a ${skill} ${position} who prefers ${preferredTime}. Reply in one friendly sentence under 100 characters.` }] }] }) });
    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    res.json({ data: { text: text || 'Try an evening 7v7 near you.' } });
  } catch (error) {
    console.error('Recommendation error:', error.message);
    res.json({ data: { text: 'Try an evening 7v7 at Andheri Football Arena.' }, fallback: true });
  }
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(port, () => console.log(`FootConnect running at http://localhost:${port}`));
