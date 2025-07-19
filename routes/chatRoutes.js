const express = require('express');
const router = express.Router();
const {
  createChat,
  continueChat,
  deleteChat,
  listChats
} = require('../controllers/chatController');

const authenticate = require('../middleware/authMiddleware');

router.post('/create', authenticate, createChat);
router.post('/continue', authenticate, continueChat);
router.delete('/:chatId', authenticate, deleteChat);
router.get('/', authenticate, listChats);

module.exports = router;
