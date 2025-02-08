const express = require('express');
const router = express.Router();
const authCont = require('../controller/authCont');

// User routes for registration and login
router.post('/register', authCont.registerUser);

router.post('/login', authCont.loginUser);





 


module.exports = router;

