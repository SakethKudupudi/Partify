import express from 'express';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Test successful' });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✓ Test server running on port ${PORT}`);
});

