import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    if (passwords.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      const res = await axiosClient.put('/users/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });

      if (res.data.success) {
        toast.success("Password updated successfully");
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error("Change password failed", error);
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-8 px-4 min-h-screen">
      <h1 className="text-2xl font-bold text-pink-950 mb-6 flex items-center gap-2">
        <Lock className="text-pink-500" />
        Security Settings
      </h1>

      <div className="bg-white/90 backdrop-blur-md border border-pink-200/80 rounded-2xl p-6 shadow-lg shadow-pink-200/30">
        <h2 className="text-lg font-semibold text-pink-900 mb-4">Change Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-pink-800/80 font-medium text-sm mb-1">Current Password</label>
            <input 
              type="password"
              name="oldPassword"
              value={passwords.oldPassword}
              onChange={handleChange}
              className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none transition-all"
              placeholder="Enter current password"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-pink-800/80 font-medium text-sm mb-1">New Password</label>
            <input 
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none transition-all"
              placeholder="Enter new password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-pink-800/80 font-medium text-sm mb-1">Confirm New Password</label>
            <input 
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none transition-all"
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 active:bg-pink-600 text-white px-6 py-2.5 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-300/40"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;