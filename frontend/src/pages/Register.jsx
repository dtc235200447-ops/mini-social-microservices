import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import Input from '../components/ui/Input';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await register(username, password, email);
    setIsLoading(false);
    
    if (result.success) {
      navigate('/login', { state: { registered: true } });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-pink-50">
      
      {/* Left Panel (Desktop Only) */}
      <div className="hidden md:flex w-1/2 bg-pink-100 relative overflow-hidden flex-col justify-center items-center p-12 text-center border-r border-pink-200">
        <div className="absolute inset-0 bg-gradient-to-bl from-rose-100/60 via-pink-200/50 to-pink-100/80" />
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold text-pink-900 mb-6">Tham gia Vibe Mini</h1>
          <p className="text-pink-700 text-lg leading-relaxed">
            Tạo tài khoản và bắt đầu kết nối với cộng đồng ngay hôm nay.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-pink-50/50">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm space-y-8 bg-white p-8 rounded-2xl shadow-lg shadow-pink-200/50 border border-pink-100"
        >
          <div className="text-center md:text-left">
             <h2 className="text-3xl font-bold text-pink-950 mb-2">Tạo tài khoản</h2>
             <p className="text-pink-600/80">Điền thông tin để bắt đầu.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
               {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              icon={User}
              type="text"
              placeholder="Tên người dùng"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              minLength={1}
              required
            />

            <Input 
              icon={Mail}
              type="email"
              placeholder="Địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            
            <Input 
              icon={Lock}
              type="password"
              placeholder="Tạo mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="
                w-full py-3 rounded-lg
                bg-pink-400 hover:bg-pink-500 active:bg-pink-600
                text-white font-semibold text-sm
                shadow-lg shadow-pink-300/40
                transition-all duration-200
                flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-pink-500 font-semibold hover:text-pink-600 transition-colors">
               Đăng nhập
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;