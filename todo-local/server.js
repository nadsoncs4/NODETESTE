// ---------- 1. Importar módulos que já vêm no Node ----------
const http = require('http');   // cria servidores web
const fs   = require('fs');     // lê e escreve arquivos
const path = require('path');   // monta caminhos de pastas/arquivos

const ARQUIVO = './tarefas.json';

// ---------- 2. Funções auxiliares ----------
function lerTarefas() {
  return JSON.parse(fs.readFileSync(ARQUIVO, 'utf-8'));
}

function salvarTarefas(tarefas) {
  fs.writeFileSync(ARQUIVO, JSON.stringify(tarefas, null, 2));
}

// ---------- 3. Criar o servidor ----------
const servidor = http.createServer((req, res) => {

  // Rota 1: entregar a página HTML ao navegador
  if (req.method === 'GET' && req.url === '/') {
    const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // Rota 2: devolver a lista de tarefas (GET /tarefas)
  if (req.method === 'GET' && req.url === '/tarefas') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(lerTarefas()));
    return;
  }

  // Rota 3: adicionar tarefa (POST /tarefas)
  if (req.method === 'POST' && req.url === '/tarefas') {
    let corpo = '';
    req.on('data', pedaco => corpo += pedaco);
    req.on('end', () => {
      const { titulo } = JSON.parse(corpo);
      const tarefas = lerTarefas();
      tarefas.push({ id: Date.now(), titulo, feita: false });
      salvarTarefas(tarefas);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  // Rota 4: marcar/desmarcar como feita (PUT /tarefas/:id)
  if (req.method === 'PUT' && req.url.startsWith('/tarefas/')) {
    const id = Number(req.url.split('/')[2]);
    const tarefas = lerTarefas();
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) tarefa.feita = !tarefa.feita;
    salvarTarefas(tarefas);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Rota 5: apagar tarefa (DELETE /tarefas/:id)
  if (req.method === 'DELETE' && req.url.startsWith('/tarefas/')) {
    const id = Number(req.url.split('/')[2]);
    const tarefas = lerTarefas().filter(t => t.id !== id);
    salvarTarefas(tarefas);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Rota 6: qualquer outra coisa → 404
  res.writeHead(404);
  res.end('Não encontrado');
});

// ---------- 4. Ligar o servidor na porta 3000 ----------
servidor.listen(3000, () => {
  console.log('✅ Servidor rodando! Abra: http://localhost:3000');
});