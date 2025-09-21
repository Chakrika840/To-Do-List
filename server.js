const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",        
  password: "root",    
  database: "todo"
});

db.connect(err => {
  if (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
  console.log("Database connected");
});

app.get("/get-items", (req, res) => {
  db.query("SELECT * FROM todoItems ORDER BY ID DESC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

app.post("/add-item", (req, res) => {
  const item = req.body.value;
  if (!item || item.trim() === "") return res.status(400).json({ error: "Todo cannot be empty" });
  
  db.query("INSERT INTO todoItems (itemDescription) VALUES (?)", [item], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ ID: result.insertId, itemDescription: item });
  });
});

app.put("/update-item/:id", (req, res) => {
  const id = req.params.id;
  const value = req.body.value;
  db.query("UPDATE todoItems SET itemDescription = ? WHERE ID = ?", [value, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true, ID: id, itemDescription: value });
  });
});

app.delete("/delete-item/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM todoItems WHERE ID = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true, ID: id });
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
