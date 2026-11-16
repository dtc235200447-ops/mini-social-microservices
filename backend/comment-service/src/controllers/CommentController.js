const Comment = require('../models/Comment');

class CommentController {
  async create(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      const { content, postId } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!content || !postId) {
        return res.status(400).json({ error: 'Missing fields' });
      }

      const newComment = await Comment.create({ content, postId, userId });
      return res.status(201).json(newComment);
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getByPostId(req, res) {
    try {
      const { postId } = req.params;
      const comments = await Comment.findAll({
        where: { postId },
        order: [['createdAt', 'DESC']]
      });
      return res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new CommentController();
