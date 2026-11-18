import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const DeletePostModal = ({ onClose, onConfirm, isDeleting }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-pink-950/30 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm bg-white border border-pink-200 rounded-2xl shadow-2xl shadow-pink-200/50 overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-rose-500" size={24} />
          </div>
          
          <h3 className="text-lg font-bold text-pink-950 mb-2">Delete Post?</h3>
          <p className="text-slate-600 text-sm mb-6">
            Are you sure you want to delete this post? This action cannot be undone and will remove it from your profile permanently.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-rose-300/40"
            >
              {isDeleting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeletePostModal;