import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
// Nguyen Khac bao
export const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => ({ success: false, error: 'Chưa khởi tạo được phiên đăng nhập' }),
  register: async () => ({ success: false, error: 'Chưa khởi tạo được phiên đăng ký' }),
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // We do NOT force reload. The router will handle redirecting to /login if needed.
  };

  // Helper to fetch full user data
  const fetchCurrentUser = async (userId) => {
    try {
      const res = await axiosClient.get(`/users/${userId}`);
      if (res.data && res.data.success) {
        setUser(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details", error);
      // Keep the basic user from the login response if profile loading fails.
      // Only remove the session when the server confirms that the token is invalid.
      if (error.response && error.response.status === 401) {
         toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
         logout();
      }
    }
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
             const payload = JSON.parse(atob(token.split('.')[1]));
             
             // Check if token is expired (simple check)
             const currentTime = Date.now() / 1000;
             if (payload.exp && payload.exp < currentTime) {
               throw new Error("Token expired");
             }

             // Set initial basic info from token
             setUser({ id: payload.id, username: payload.username || 'User' });
             
             // Then fetch full details
             await fetchCurrentUser(payload.id);
        } catch (e) {
            console.error("Invalid token or session", e);
            logout();
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const payload = {
      email: email.trim().toLowerCase(),
      password,
    };
    try {
      let response;
      try {
        response = await axiosClient.post('/users/login', payload);
      } catch (firstError) {
        if (!firstError.response) {
          await new Promise(resolve => setTimeout(resolve, 500));
          response = await axiosClient.post('/users/login', payload);
        } else {
          throw firstError;
        }
      }
      
      if (response.data && response.data.success) {
        const { token, user: basicUser } = response.data.data; 
        
        localStorage.setItem('token', token);
        setUser(basicUser);

        // Do not block navigation on an optional profile request.
        fetchCurrentUser(basicUser.id);
        
        return { success: true };
      } else {
        return { success: false, error: 'Máy chủ trả dữ liệu đăng nhập không hợp lệ' };
      }
    } catch (error) {
      console.error("Login error", error);
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 401) return { success: false, error: 'Email hoặc mật khẩu không đúng' };
      if (status === 404) return { success: false, error: 'Tài khoản không tồn tại. Hãy đăng ký trước.' };
      if (status === 429) return { success: false, error: 'Bạn thử đăng nhập quá nhiều lần. Hãy thử lại sau.' };
      if (!error.response) return { success: false, error: 'Không kết nối được máy chủ đăng nhập' };
      return { success: false, error: message || 'Đăng nhập thất bại' };
    }
  };

  const register = async (username, password, email) => {
    const payload = {
      username: username.trim(),
      password,
      email: email.trim().toLowerCase(),
    };
    try {
      let response;
      try {
        response = await axiosClient.post('/users/register', payload);
      } catch (firstError) {
        if (!firstError.response) {
          await new Promise(resolve => setTimeout(resolve, 500));
          response = await axiosClient.post('/users/register', payload);
        } else {
          throw firstError;
        }
      }
      return { success: true };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 409) return { success: false, error: 'Email này đã được đăng ký. Hãy đăng nhập.' };
      if (status === 400) return { success: false, error: message || 'Thông tin đăng ký không hợp lệ' };
      if (!error.response) return { success: false, error: 'Không kết nối được máy chủ đăng ký' };
      return { success: false, error: message || 'Đăng ký thất bại' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
