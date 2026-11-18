import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Input from '../components/ui/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-pink-50">
      
      {/* Left Panel - Branding (Desktop Only) */}
      <div className="hidden md:flex w-1/2 bg-pink-100 relative overflow-hidden flex-col justify-center items-center p-12 text-center border-r border-pink-200">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200/60 via-rose-100/50 to-pink-100/80" />
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold text-pink-900 mb-6">Vibe Mini</h1>
          <p className="text-pink-700 text-lg leading-relaxed">
            Kết nối sâu hơn. Chia sẻ nhanh hơn. <br/>
            Trải nghiệm mạng xã hội thế hệ mới.
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
             <h2 className="text-3xl font-bold text-pink-950 mb-2">Chào mừng trở lại</h2>
             <p className="text-pink-600/80">Nhập thông tin để đăng nhập.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
               {error}
            </div>
          )}
          {location.state?.registered && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm text-center font-medium">
              Đăng ký thành công. Hãy đăng nhập.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              icon={Mail}
              type="email"
              placeholder="Địa chỉ email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            
            <div className="space-y-1">
              <Input 
                icon={Lock}
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <div className="flex justify-end pt-1">
                <Link to="#" className="text-xs text-pink-500 hover:text-pink-600 font-medium">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

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
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-pink-500 font-semibold hover:text-pink-600 transition-colors">
               Đăng ký miễn phí
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;