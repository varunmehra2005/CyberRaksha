require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); 


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

const postSchema = new mongoose.Schema({
  content: String,
  user: String, 
  replies: [
    {
      text: String,
      timestamp: String,
      user: String 
    }
  ]
});
const Post = mongoose.model('Post', postSchema);


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
  res.send({ message: "Login successful!", username });
});


app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ _id: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving posts", error: err });
  }
});


app.post('/posts', async (req, res) => {
  try {
    const { content, username } = req.body;
    const post = new Post({ content, user: username, replies: [] });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Error creating post", error: err });
  }
});


app.post('/posts/:id/reply', async (req, res) => {
  try {
    const { text, timestamp, username } = req.body;
    const post = await Post.findById(req.params.id);
    post.replies.push({ text, timestamp, user: username });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Error adding reply", error: err });
  }
});


app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'user', 'communityforum', 'community_form.html'));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
