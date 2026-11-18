const userRepository = require('../repositories/UserRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  return process.env.JWT_SECRET;
};

class UserService {
  async register(data) {
    if (!data.email || !data.password || !data.username) {
      throw new Error('Vui lòng nhập đầy đủ tên người dùng, email và mật khẩu');
    }

    const email = data.email.trim().toLowerCase();
    const username = data.username.trim();
    if (!username) {
      throw new Error('Tên người dùng không được để trống');
    }
    if (data.password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('Email này đã được đăng ký');
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({
      ...data,
      username,
      email,
      password: hashedPassword
    });

    // Remove password from return object
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(cleanEmail);
    if (!user) throw new Error('Email hoặc mật khẩu không đúng');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Email hoặc mật khẩu không đúng');

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    return { token, user: { id: user.id, username: user.username } };
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error('Incorrect old password');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update(userId, { password: hashedPassword });

    return true;
  }
}

module.exports = new UserService();
