// Importamos librerías requeridas
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

// Inicializamos Express
const app = express();

// Parser JSON
const jsonParser = bodyParser.json();

// Conectar a la base de datos SQLite
let db = new sqlite3.Database("./base.sqlite3", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Conectado a SQLite");

  db.run(
    `CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`,
    (err) => {
      if (err) console.error(err.message);
      else console.log("Tabla creada o existente");
    }
  );
});

// INSERTAR TODO (POST)
app.post("/insert", jsonParser, (req, res) => {
  const { todo } = req.body;

  if (!todo) {
    res.status(400).json({ error: "Falta campo todo" });
    return;
  }

  const stmt = db.prepare(
    "INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)"
  );

  stmt.run(todo, (err) => {
    if (err) {
      console.error("Error insertando:", err);
      res.status(500).json({ error: "Error en DB" });
      return;
    }
    console.log("Insert exitoso");
    res.status(201).json({ status: "creado" });
  });

  stmt.finalize();
});

// LISTA DE TODOS (GET)
app.get("/todos", (req, res) => {
  db.all("SELECT * FROM todos", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: "Error en DB" });
      return;
    }
    res.json(rows);
  });
});

// Endpoint raíz
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Render usa un puerto dinámico
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Aplicación en funcionamiento en puerto ${port}`);
});
