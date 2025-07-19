const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const userDataPath = path.join(__dirname, '../users/user_data.json');

const loginUser = (req, res) => {
  console.log("Login route hit");
  const { username, password } = req.body;
  console.log("Received credentials:", username, password);

  // Read user data
  const users = JSON.parse(fs.readFileSync(userDataPath));

  // Check credentials
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  // ✅ SEND RESPONSE
  res.status(200).json({
    message: 'Login successful',
    token
  });
};

module.exports = { loginUser };
