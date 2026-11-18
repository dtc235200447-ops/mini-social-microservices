import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import PostCard from '../components/feed/PostCard';
import { ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch Post Data
        const res = await axiosClient.get(`/posts/${postId}`);
        const postData = res.data.data;

        if (!postData) {
          throw new Error("Post data is empty");
        }

        // 2. Fetch Author Data
        let author = { username: 'Unknown', avatarUrl: null };
        try {
            if (postData.userId) {
                const userRes = await axiosClient.get(`/users/${postData.userId}`);
                if (userRes.data && userRes.data.data) {
                    author = userRes.data.data;
                }
            }
        } catch (userErr) {
          console.error("Failed to fetch author details", userErr);
        }

        // 3. Enrich and Set Post
        setPost({
          ...postData,
          author
        });
      } catch (err) {
        console.error("Failed to fetch post", err);
        setError(err.response?.data?.message || "Post not found or deleted.");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeletePost = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
            <ArrowLeft className="text-rose-500" size={24} />
        </div>
        <h2 className="text-xl font-bold text-pink-950 mb-2">Page Not Found</h2>
        <p className="text-slate-600 mb-6">{error || "The post you are looking for does not exist."}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-pink-400 hover:bg-pink-500 text-white rounded-full transition-colors font-medium shadow-md shadow-pink-300/40"
        >
          Go back home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/40">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-pink-50/80 backdrop-blur-md border-b border-pink-200/70 px-4 py-3 flex items-center gap-4">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-pink-100 transition-colors text-pink-900"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-pink-950">Post</h1>
      </div>

      {/* Content */}
      <div className="pb-20">
        <PostCard 
            post={post} 
            onDelete={handleDeletePost} 
            defaultShowComments={true} 
        />
      </div>
    </div>
  );
};

export default PostDetail;