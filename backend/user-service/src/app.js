const express = require('express');
const multer = require('multer');
const sequelize = require('./config/database');
const userController = require('./controllers/UserController');
const User = require('./models/User');
const Follow = require('./models/Follow');

// Define Associations
User.belongsToMany(User, { as: 'Followers', through: Follow, foreignKey: 'followingId' });
User.belongsToMany(User, { as: 'Following', through: Follow, foreignKey: 'followerId' });

const app = express();
const PORT = process.env.PORT || 3001;
const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024);

// Configure Multer with Memory Storage (Stream to GCS)
const storage = multer.memoryStorage();
const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image uploads are allowed'));
  }
  return cb(null, true);
};
const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 2 },
  fileFilter: imageFileFilter,
});

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

// Routes
const router = express.Router();
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/search', userController.search);
router.get('/following-ids', userController.getFollowingIds);
router.get('/batch', userController.getUsersByIds);
router.put('/profile', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.get('/:id', userController.getProfile);
router.post('/:id/follow', userController.followUser);
router.delete('/:id/follow', userController.unfollowUser);

app.use('/', router);

// Health Check
app.get('/health', (req, res) => res.send('User Service is OK'));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Only image uploads are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }
  return next(err);
});

// Start Server & DB Connection
const start = async () => {
  try {
    await sequelize.sync({ alter: true }); 
    console.log('📦 Database connected and synced');
    app.listen(PORT, () => console.log(`🚀 User Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};


start();
