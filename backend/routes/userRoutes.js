const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { updateUserValidation } = require('../utils/validators');
const validate = require('../middleware/validateMiddleware');

router.route('/').get(protect, admin, getUsers);
router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, updateUserValidation, validate, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;