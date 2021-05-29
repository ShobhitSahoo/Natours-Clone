const express = require('express');
const viewsController = require('./../Controllers/viewsController');
const authController = require('./../Controllers/authController');
const bookingController = require('../Controllers/bookingController');

const router = express.Router();

// router.use(authController.isLoggedIn);

router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);

router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

router.get('/me', authController.protect, viewsController.getAccount);

router.post('/submit-user-data', authController.protect, viewsController.updateUserData);

module.exports = router;