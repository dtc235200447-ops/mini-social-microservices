import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { getImageUrl } from '../../utils/imageUtils';

const UserSuggestion = ({ name, handle, color }) => (
  <div className="flex items-center gap-3 p-3 hover:bg-pink-50 rounded-xl cursor-pointer transition-colors">
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex-shrink-0 shadow-sm`} />
    <div className="flex-1 overflow-hidden">
      <p className="font-bold text-sm text-slate-800 truncate">{name}</p>
      <p className="text-pink-600/80 text-xs truncate">{handle}</p>
    </div>
    <button className="bg-pink-400 hover:bg-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors shadow-sm shadow-pink-300/30">
      Follow
    </button>
  </div>
);

const RightPanel = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true);
        try {
          const res = await axiosClient.get(`/users/search?q=${query}`);
          setResults(res.data.data);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="h-screen sticky top-0 py-6 px-4 hidden lg:flex flex-col gap-6 border-l border-pink-200/70 bg-pink-50/80">
      {/* Search */}
      <div className="relative z-50">
        <input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Vibe Mini" 
          className="w-full bg-white border border-pink-200 rounded-full py-3 px-6 text-sm text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all placeholder:text-pink-300 shadow-sm" 
        />
        
        {/* Search Results Dropdown */}
        {(results.length > 0 || isSearching) && (
          <div className="absolute top-full mt-2 w-full bg-white border border-pink-200 rounded-2xl shadow-xl shadow-pink-200/40 overflow-hidden max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-pink-500 text-sm">Searching...</div>
            ) : (
              results.map(user => (
                <Link 
                  key={user.id} 
                  to={`/profile/${user.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-pink-50 transition-colors border-b border-pink-100 last:border-0"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex-shrink-0 overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={getImageUrl(user.avatarUrl)} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-pink-400 to-rose-400">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{user.username}</p>
                    <p className="text-pink-600/80 text-xs truncate">User #{user.id}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* Who to follow */}
      <div className="bg-white/90 rounded-2xl border border-pink-200/70 p-4 shadow-sm shadow-pink-200/30">
        <h3 className="font-bold text-lg text-pink-950 mb-4 px-2">Who to follow</h3>
        <div className="space-y-1">
          <UserSuggestion name="Elon Musk" handle="@elonmusk" color="from-amber-300 to-orange-400" />
          <UserSuggestion name="React Team" handle="@reactjs" color="from-sky-300 to-blue-400" />
          <UserSuggestion name="Gemini AI" handle="@googleai" color="from-pink-400 to-rose-500" />
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-pink-600/70 px-4 leading-relaxed">
        <span className="hover:underline cursor-pointer">Terms of Service</span> · 
        <span className="hover:underline cursor-pointer ml-1">Privacy Policy</span> · 
        <span className="hover:underline cursor-pointer ml-1">Cookie Policy</span> <br/>
        © 2026 Vibe Mini Inc.
      </div>
    </div>
  );
};

export default RightPanel;