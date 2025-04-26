const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const COMMENTS_FILE = path.join(__dirname, 'server/comments.json');

app.post('/saveComment', (req, res) => {
  const newComment = req.body;
  
  try {
    // Đọc comments hiện tại
    const comments = JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf8'));
    
    // Thêm comment mới
    comments.push(newComment);
    
    // Ghi lại vào file
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
    
    res.json({ success: true, comment: newComment });
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ error: 'Failed to save comment' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 