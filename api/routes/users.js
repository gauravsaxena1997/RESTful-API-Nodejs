const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users');
const checkAuth = require('../middleware/check-auth');

router.get('/', usersController.get_all_users);

router.post('/signup', usersController.user_signup);

router.post('/login', usersController.user_login);

router.delete('/:userId', checkAuth,usersController.delete_user);

module.exports = router;