// server.js
const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./db');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add new matter
app.post('/matters', (req, res) => {
  const matter = req.body;
  const sql = 'INSERT INTO Matters SET ?';
  connection.query(sql, matter, (err, result) => {
    if (err) {
      console.error('Error inserting matter: ' + err);
      res.status(500).json({ error: 'Error inserting matter' });
      return;
    }
    res.status(201).json({ message: 'Matter added successfully' });
  });
});

// Fetch all matters
app.get('/matters', (req, res) => {
  const sql = 'SELECT * FROM Matters ORDER BY ClientID';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching matters: ' + err);
      res.status(500).json({ error: 'Error fetching matters' });
      return;
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
