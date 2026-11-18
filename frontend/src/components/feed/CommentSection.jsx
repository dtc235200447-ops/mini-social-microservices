import React, { useState, useEffect, useContext } from 'react';
import axiosClient from '../../api/axiosClient';
import { Send } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchComments = async () => {
    try {
      const res = await axiosClient.get(`/comments/${postId}`);
      setComments(res.data);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axiosClient.post('/comments', { 
        content: newComment, 
        postId,
      });
      
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error("Failed to post comment", error);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-pink-200/70">
      <div className="space-y-4 mb-4">
        {loading ? (
          <p className="text-pink-600/70 text-sm">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-pink-600/70 text-sm">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold shadow-sm">
                {comment.userId?.toString()[0] || 'U'}
              </div>
              <div className="bg-pink-50/90 border border-pink-100 rounded-2xl rounded-tl-none p-3 text-sm text-slate-700 flex-1">
                <span className="font-bold text-pink-950 block text-xs mb-1">User #{comment.userId}</span>
                {comment.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold shadow-sm">
            {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <input
          type="text"
          placeholder="Write a comment..."
          className="flex-1 bg-white border border-pink-200 rounded-full px-4 py-2 text-sm text-slate-800 placeholder:text-pink-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-colors"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!newComment.trim()}
          className="text-pink-500 hover:bg-pink-100 p-2 rounded-full transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default CommentSection;