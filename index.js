require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (e.g., logo.png, Home.html, video, etc.)
app.use(express.static(path.join(__dirname)));
app.use('/user', express.static(path.join(__dirname, 'views', 'user')));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected to Atlas"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Home.html'));
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.send("Username already exists.");
  await new User({ username, password }).save();
  res.send("Signup successful!");
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.send("Invalid credentials.");
  res.send("Login successful! Welcome, " + username);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
