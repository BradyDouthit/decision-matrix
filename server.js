const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function readItems() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeItems(items) {
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2));
}

function clampScore(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 5;
  if (num < 0) return 0;
  if (num > 10) return 10;
  return num;
}

app.get('/api/items', async (req, res) => {
  const items = await readItems();
  res.json(items);
});

app.post('/api/items', async (req, res) => {
  const { name, cost, usefulness, notes } = req.body;
  if (typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'name is required' });
    return;
  }

  const item = {
    id: crypto.randomUUID(),
    name: name.trim(),
    cost: clampScore(cost),
    usefulness: clampScore(usefulness),
    notes: typeof notes === 'string' ? notes.trim() : '',
  };

  const items = await readItems();
  items.push(item);
  await writeItems(items);
  res.status(201).json(item);
});

app.patch('/api/items/:id', async (req, res) => {
  const items = await readItems();
  const item = items.find((i) => i.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'item not found' });
    return;
  }

  const { name, cost, usefulness, notes } = req.body;
  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'name must be a non-empty string' });
      return;
    }
    item.name = name.trim();
  }
  if (cost !== undefined) item.cost = clampScore(cost);
  if (usefulness !== undefined) item.usefulness = clampScore(usefulness);
  if (notes !== undefined) item.notes = typeof notes === 'string' ? notes.trim() : '';

  await writeItems(items);
  res.json(item);
});

app.delete('/api/items/:id', async (req, res) => {
  const items = await readItems();
  const next = items.filter((i) => i.id !== req.params.id);
  if (next.length === items.length) {
    res.status(404).json({ error: 'item not found' });
    return;
  }
  await writeItems(next);
  res.status(204).end();
});

app.listen(PORT, HOST, () => {
  console.log(`Decision matrix running at http://${HOST}:${PORT}`);
});
