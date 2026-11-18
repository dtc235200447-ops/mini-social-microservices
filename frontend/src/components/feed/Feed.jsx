import React, { useState, useEffect, useContext, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import { AuthContext } from '../../context/AuthContext';
import PostCard from './PostCard';
import { Image, X } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

const Feed = () => {
  const [activeTab, setActiveTab] = useState('for-you'); // 'for-you' | 'following'
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [isPosting, setIsPosting] = useState(false); 
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const fetchPosts = async () => {
    setLoading(true); 
    try {
      let url = '/posts';
      
      if (activeTab === 'following') {
        const followRes = await axiosClient.get('/users/following-ids');
        const followingIds = followRes.data.data;

        if (followingIds.length === 0) {
          setPosts([]);
          return; 
        }
        url = `/posts?userIds=${followingIds.join(',')}`;
      }

      // 1. Fetch Posts
      const res = await axiosClient.get(url);
      const rawPosts = res.data.data || res.data;

      if (rawPosts.length === 0) {
        setPosts([]);
        return;
      }

      // 2. Extract Unique User IDs
      const userIds = [...new Set(rawPosts.map(p => p.userId))];

      // 3. Fetch User Details (Batch)
      const usersRes = await axiosClient.get(`/users/batch?ids=${userIds.join(',')}`);
      const users = usersRes.data.data;
      
      // Create a map for quick lookup: { [id]: userObject }
      const userMap = {};
      users.forEach(u => { userMap[u.id] = u; });

      // 4. Attach User Data to Posts
      const enrichedPosts = rawPosts.map(post => ({
        ...post,
        author: userMap[post.userId] || { username: 'Unknown', avatarUrl: null }
      }));

      setPosts(enrichedPosts); 
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(); 
  }, [activeTab]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage) return;

    // --- 1. Optimistic Update ---
    
    const tempId = Date.now(); // Temporary ID for local tracking
    const tempPost = {
      id: tempId,
      userId: user?.id,
      content: content,
      imageUrl: previewUrl, // Use the blob URL directly
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
      author: {
        id: user?.id,
        username: user?.username || 'You',
        avatarUrl: user?.avatarUrl,
      },
      isOptimistic: true, // Flag to potentially style it differently (e.g., opacity)
    };

    // Update UI Immediately
    setPosts((prev) => [tempPost, ...prev]);
    
    // Reset Form Immediately
    const postContent = content; // Capture for request
    const postImage = selectedImage; // Capture for request
    setContent('');
    clearImage();
    setIsPosting(false); // Ensure UI is interactive

    // --- 2. Background Sync ---
    
    try {
      const formData = new FormData();
      formData.append('content', postContent);
      if (postImage) {
        formData.append('image', postImage);
      }
      
      const res = await axiosClient.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (res.data.success) {
        const realPost = res.data.data;
        
        // Enrich real post
        const enrichedRealPost = {
          ...realPost,
          author: tempPost.author, // Keep the author info
          likesCount: 0,
          isLiked: false,
        };

        // Replace temp post with real post
        setPosts((prev) => prev.map((p) => (p.id === tempId ? enrichedRealPost : p)));
      }
    } catch (error) {
      console.error("Failed to create post background sync", error);
      
      // Remove temp post on failure and alert user
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
      alert("Failed to post. Please try again."); // Simple alert for now
      
      // Optionally restore content here if desired, but simple removal is safer
    }
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div>
      {/* Sticky Header with Tabs */}
      <div className="sticky top-0 z-10 bg-pink-50/80 backdrop-blur-md border-b border-pink-200/70">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('for-you')}
            className="flex-1 hover:bg-pink-100/70 transition-colors cursor-pointer py-4 text-center relative"
          >
            <span className={`font-bold text-sm ${activeTab === 'for-you' ? 'text-pink-950' : 'text-pink-600/70'}`}>
              For you
            </span>
            {activeTab === 'for-you' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-pink-500 rounded-full"></div>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('following')}
            className="flex-1 hover:bg-pink-100/70 transition-colors cursor-pointer py-4 text-center relative"
          >
            <span className={`font-bold text-sm ${activeTab === 'following' ? 'text-pink-950' : 'text-pink-600/70'}`}>
              Following
            </span>
            {activeTab === 'following' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-pink-500 rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Create Post Input */}
      <div className="p-4 border-b border-pink-200/70 bg-white/60">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-sm">
             {user?.avatarUrl ? (
               <img src={getImageUrl(user.avatarUrl)} alt="User" className="w-full h-full object-cover" />
             ) : (
               user?.username?.[0]?.toUpperCase() || 'U'
             )}
          </div>
          <form onSubmit={handleCreatePost} className="flex-1">
            <textarea
              className="w-full bg-transparent text-xl text-slate-800 placeholder:text-pink-300 border-none focus:ring-0 resize-none h-24 p-0 outline-none"
              placeholder="What is happening?!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            ></textarea>

            {/* Image Preview */}
            {previewUrl && (
              <div className="relative mb-3 w-full rounded-xl overflow-hidden border border-pink-200">
                <img src={previewUrl} alt="Preview" className="w-full max-h-[300px] object-cover" />
                <button 
                  type="button"
                  onClick={clearImage}
                  disabled={isPosting}
                  className="absolute top-2 right-2 bg-pink-950/60 hover:bg-pink-950/80 text-white p-1 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-pink-100 pt-3">
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  className="hidden" 
                  accept="image/*"
                  disabled={isPosting}
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  disabled={isPosting}
                  className={`text-pink-500 p-2 rounded-full transition-colors ${isPosting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-100'}`}
                >
                  <Image size={20} />
                </button>
              </div>
              
              <button 
                type="submit" 
                disabled={(!content.trim() && !selectedImage) || isPosting}
                className="bg-pink-400 hover:bg-pink-500 disabled:opacity-50 disabled:hover:bg-pink-400 text-white font-bold px-5 py-1.5 rounded-full text-sm transition-all shadow-sm shadow-pink-300/40"
              >
                {isPosting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Feed List */}
      <div>
        {loading ? (
           <div className="flex justify-center py-10">
             <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : posts.length === 0 ? (
           <div className="text-center py-10 text-pink-600/70">
             {activeTab === 'following' 
               ? "You aren't following anyone yet (or they haven't posted)." 
               : "No posts yet. Be the first to share something!"}
           </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={post.isOptimistic ? "opacity-70 transition-opacity" : ""}>
               <PostCard post={post} onDelete={handleDeletePost} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;