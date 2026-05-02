const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return { events: [] };
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return { events: [] }; }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.post('/webhook/onboarding', (req, res) => {
  const name   = req.body['nome']  || req.body['name'];
  const date   = req.body['Dia da movimentação'] || req.body['date'];
  const status = req.body['etapa'] || req.body['status'];
  const owner  = req.body['owner'] || '—';

  const validStatuses = ['agendado', 'concluido', 'cancelado'];
  if (!name || !status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Campos obrigatórios: nome, etapa (agendado | concluido | cancelado)'
    });
  }

  const now = new Date();

  let eventMonth = now.getMonth();
  let eventYear  = now.getFullYear();
  if (date) {
    const parts = date.split('/');
    if (parts.length === 3) {
      eventMonth = parseInt(parts[1], 10) - 1;
      eventYear  = parseInt(parts[2], 10);
    }
  }

  const event = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    status,
    date: date || now.toLocaleDateString('pt-BR'),
    owner,
    month: eventMonth,
    year:  eventYear,
    receivedAt: now.toISOString()
  };

  const data = loadData();
  data.events.push(event);
  saveData(data);

  console.log(`[${new Date().toLocaleTimeString('pt-BR')}] Novo evento: ${event.name} → ${event.status}`);
  res.status(201).json({ ok: true, event });
});

app.get('/api/events', (req, res) => {
  const data = loadData();
  res.json(data.events);
});

app.delete('/api/events/:id', (req, res) => {
  const data = loadData();
  const before = data.events.length;
  data.events = data.events.filter(e => e.id !== req.params.id);
  if (data.events.length === before) return res.status(404).json({ error: 'Evento não encontrado' });
  saveData(data);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📡 Webhook disponível em: POST http://localhost:${PORT}/webhook/onboarding`);
  console.log(`📊 Dashboard em: http://localhost:${PORT}\n`);
});
