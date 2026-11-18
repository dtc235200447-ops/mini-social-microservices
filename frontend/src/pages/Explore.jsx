import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import PostCard from '../components/feed/PostCard';

const Explore = () => {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          // 1. Search Posts
          const res = await axiosClient.get(`/posts/search?q=${encodeURIComponent(query)}`);
          const rawPosts = res.data.data;

          if (rawPosts.length === 0) {
            setPosts([]);
            setLoading(false);
            return;
          }

          // 2. Extract User IDs
          const userIds = [...new Set(rawPosts.map(p => p.userId))];

          // 3. Batch Fetch Users
          const usersRes = await axiosClient.get(`/users/batch?ids=${userIds.join(',')}`);
          const users = usersRes.data.data;
          
          const userMap = {};
          users.forEach(u => { userMap[u.id] = u; });

          // 4. Enrich
          const enrichedPosts = rawPosts.map(post => ({
            ...post,
            author: userMap[post.userId] || { username: 'Unknown', avatarUrl: null }
          }));

          setPosts(enrichedPosts);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setLoading(false);
        }
      } else {
        setPosts([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white/40">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-10 bg-pink-50/80 backdrop-blur-md border-b border-pink-200/70 px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Back Button (Mobile friendly) */}
          <button 
            onClick={handleBack}
            className="xl:hidden p-2 rounded-full hover:bg-pink-100 transition-colors text-pink-900"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-pink-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-white border border-pink-200 rounded-full leading-5 text-slate-800 placeholder-pink-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 sm:text-sm transition-all shadow-sm"
              placeholder="Search for posts, topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="pb-20">
        {loading ? (
           <div className="flex justify-center py-10">
             <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : query && posts.length === 0 ? (
           <div className="text-center py-20 px-4">
             <p className="text-pink-600/70 text-lg">No results found for "{query}"</p>
           </div>
        ) : !query ? (
           <div className="text-center py-20 px-4">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 text-pink-500 mb-4 shadow-sm">
               <Search size={32} />
             </div>
             <h3 className="text-pink-950 text-lg font-bold mb-2">Explore Vibe Mini</h3>
             <p className="text-pink-600/80">Search for people, topics, and keywords.</p>
           </div>
        ) : (
          <div>
            {posts.map((post) => (
               <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;