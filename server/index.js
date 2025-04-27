const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Đường dẫn đến file comments.json
const COMMENTS_FILE = path.join(__dirname, '../src/server/comments.json');

// API lấy tất cả comments
app.get('/api/comments', async (req, res) => {
  try {
    const data = await fs.readFile(COMMENTS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading comments:', error);
    res.status(500).json({ error: 'Error reading comments' });
  }
});

// API thêm comment mới
app.post('/api/comments', async (req, res) => {
  try {
    const newComment = req.body;
    
    // Đọc comments hiện tại
    const data = await fs.readFile(COMMENTS_FILE, 'utf8');
    const comments = JSON.parse(data);
    
    // Thêm comment mới
    comments.push(newComment);
    
    // Ghi lại vào file
    await fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2));
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ error: 'Error saving comment' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 