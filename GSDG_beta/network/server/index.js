const express = require('express');
const cors = require('cors');
const {
    queryDataFromWriteChain,
    queryPointerFromReadChain,
    writeDataToWriteChain,
    writePointerToReadChain,
  } = require('./fabricClient');
  

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Query data from WriteChain
app.get('/api/writeChain/data/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await queryDataFromWriteChain(id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to query data from WriteChain' });
  }
});

// Query pointer from ReadChain
app.get('/api/readChain/pointer/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const pointer = await queryPointerFromReadChain(id);
    res.json(pointer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to query pointer from ReadChain' });
  }
});


app.post('/api/writeChain/data', async (req, res) => {
try {
    const { id, data } = req.body;
    const result = await writeDataToWriteChain(id, data);
    res.json(result);
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to write data to WriteChain', 
                            msg: err.message || err.toString()});
}
});

// Write pointer to ReadChain
app.post('/api/readChain/pointer', async (req, res) => {
try {
    const { id, pointer } = req.body;
    const result = await writePointerToReadChain(id, pointer);
    res.json(result);
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to write pointer to ReadChain' });
}
});
  

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


