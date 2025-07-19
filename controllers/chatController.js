const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

const chatsDir = path.join(__dirname, '..', 'chats');

if (!fs.existsSync(chatsDir)) fs.mkdirSync(chatsDir);

// List user's chat IDs
exports.listChats = (req, res) => {
  const username = req.user.username;
  const files = fs.readdirSync(chatsDir).filter(f => f.startsWith(username));
  const chatIds = files.map(f => f.split('_')[1].replace('.json', ''));
  res.json(chatIds);
};

// Create a new chat
exports.createChat = async (req, res) => {
  const username = req.user.username;
  const chatId = Date.now().toString();
  const { message } = req.body;

  const messages = [{ role: "user", content: message }];

  const response = await callOpenRouter(messages);
  if (!response) return res.status(500).json({ error: "Failed to get reply." });

  messages.push({ role: "assistant", content: response });

  const filePath = path.join(chatsDir, `${username}_${chatId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));

  res.json({ chatId, messages });
};

// Continue an existing chat
exports.continueChat = async (req, res) => {
  const username = req.user.username;
  const { chatId, message } = req.body;
  const filePath = path.join(chatsDir, `${username}_${chatId}.json`);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Chat not found" });

  const messages = JSON.parse(fs.readFileSync(filePath));
  messages.push({ role: "user", content: message });

  const response = await callOpenRouter(messages);
  if (!response) return res.status(500).json({ error: "Failed to get reply." });

  messages.push({ role: "assistant", content: response });

  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
  res.json({ messages });
};

// Delete a chat
exports.deleteChat = (req, res) => {
  const username = req.user.username;
  const { chatId } = req.params;
  const filePath = path.join(chatsDir, `${username}_${chatId}.json`);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return res.json({ success: true });
  }

  res.status(404).json({ error: "Chat not found" });
};

// Helper to call OpenRouter
async function callOpenRouter(messages) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://yourdomain.com', // replace if hosted
        'X-Title': 'Custom Chatbot'
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b", // free model
        messages: messages,
        temperature: 0.7
      })
    });

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error("OpenRouter error:", err);
    return null;
  }
}
