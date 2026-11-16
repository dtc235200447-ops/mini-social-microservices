const express = require('express');
const multer = require('multer');
const sequelize = require('./config/database');
const postController = require('./controllers/PostController');
require('./models/Like'); 

const app = express();
const PORT = process.env.PORT || 3002;
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
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: imageFileFilter,
});

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

// Routes
const router = express.Router();

// Upload middleware stores file in memory, Controller uploads to GCS
router.post('/', upload.single('image'), postController.create);
router.get('/', postController.getAll);

// CRITICAL: Define /search BEFORE /:id to prevent ID collision
router.get('/search', postController.search);

router.get('/:id', postController.getById);
router.delete('/:id', postController.delete);
router.post('/:id/like', postController.toggleLike);

app.use('/', router);

// Health Check
app.get('/health', (req, res) => res.send('Post Service is OK'));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Only image uploads are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }
  return next(err);
});

const start = async () => {
  try {
    await sequelize.sync(); 
    console.log('📦 Post DB connected');
    app.listen(PORT, () => console.log(`🚀 Post Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

start();
