const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connection = require('./db');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add new client
app.post('/clients', (req, res) => {
  const client = req.body;

  connection.query('INSERT INTO Clients SET ?', client, (err, result) => {
    if (err) {
      console.error('Error inserting client:', err);
      return res.status(500).json({ error: 'Error inserting client' });
    }
    res.status(201).json({ message: 'Client added successfully' });
  });
});

// Fetch all clients
app.get('/clients', (req, res) => {
  const sql = 'SELECT * FROM Clients';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching clients: ' + err);
      res.status(500).json({ error: 'Error fetching clients' });
      return;
    }
    res.json(results);
  });
});



// Add new lawyer
app.post('/lawyers', (req, res) => {
  const lawyer = req.body;

  connection.query('INSERT INTO Lawyers SET ?', lawyer, (err, result) => {
    if (err) {
      console.error('Error inserting lawyer:', err);
      return res.status(500).json({ error: 'Error inserting lawyer' });
    }
    res.status(201).json({ message: 'Lawyer added successfully' });
  });
});

// Fetch all lawyers
app.get('/lawyers', (req, res) => {
  const sql = 'SELECT * FROM Lawyers';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching lawyers: ' + err);
      res.status(500).json({ error: 'Error fetching lawyers' });
      return;
    }
    res.json(results);
  });
});


// Add new matter
app.post('/matters', (req, res) => {
  const matter = req.body;

  // Check if the client ID exists
  connection.query('SELECT COUNT(*) AS count FROM clients WHERE ClientID = ?', [matter.ClientID], (err, clientResult) => {
    if (err) {
      console.error('Error checking client ID:', err);
      return res.status(500).json({ error: 'Error adding matter' });
    }

    if (clientResult[0].count === 0) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    // Check if the lawyer ID exists
    connection.query('SELECT COUNT(*) AS count FROM lawyers WHERE LawyerID = ?', [matter.LawyerID], (err, lawyerResult) => {
      if (err) {
        console.error('Error checking lawyer ID:', err);
        return res.status(500).json({ error: 'Error adding matter' });
      }

      if (lawyerResult[0].count === 0) {
        return res.status(400).json({ error: 'Invalid lawyer ID' });
      }

      // Insert the new matter
      connection.query('INSERT INTO Matters SET ?', matter, (err, result) => {
        if (err) {
          console.error('Error inserting matter:', err);
          return res.status(500).json({ error: 'Error inserting matter' });
        }
        res.status(201).json({ message: 'Matter added successfully' });
      });
    });
  });
});




// Fetch all matters
app.get('/matters', (req, res) => {
  const sql = 'SELECT Matters.*, clients.clientName FROM Matters INNER JOIN clients ON Matters.clientID = clients.clientID ORDER BY Clients.ClientName ASC';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching matters: ' + err);
      res.status(500).json({ error: 'Error fetching matters' });
      return;
    }
    res.json(results);
  });
});

// Fetch matter count by type
app.get('/matter-count-by-type', (req, res) => {
  const sql = `
    SELECT MatterType, COUNT(*) AS count
    FROM matters
    GROUP BY MatterType;
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching matter count by type:', err);
      return res.status(500).json({ error: 'Error fetching matter count' });
    }
    return res.json(results);
  });
});

// Fetch summaries with pagination
app.get('/summaries', (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 3;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT
      MatterType,
      COUNT(*) AS count
    FROM Matters
    GROUP BY MatterType
    LIMIT ?, ?;
  `;
  connection.query(sql, [offset, limit], (err, results) => {
    if (err) {
      console.error('Error fetching summaries:', err);
      return res.status(500).json({ error: 'Error fetching summaries' });
    }
    return res.json(results);
  });
});

// Delete a matter by ID
app.delete('/matters/:id', (req, res) => {
  const matterId = req.params.id;
  connection.query('DELETE FROM Matters WHERE MatterID = ?', matterId, (err, result) => {
    if (err) {
      console.error('Error deleting matter:', err);
      return res.status(500).json({ error: 'Error deleting matter' });
    }
    res.json({ message: 'Matter deleted successfully' });
  });
});




app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});




