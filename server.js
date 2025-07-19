const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chats', chatRoutes);
app.use('/api/upload', require('./routes/uploadRoutes'));


// Home route
app.get('/', (req, res) => {
  res.send('Chatbot backend is running');
});

app.post('/test', (req, res) => {
  console.log('Test route hit', req.body);
  res.json({ message: 'Test route working!' });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

