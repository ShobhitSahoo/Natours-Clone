const Tour = require('./../Models/tourModel');
const User = require('./../Models/userModel');
const Booking = require('./../Models/bookingModel');
const catchAsync = require('./../Utils/catchAsync');
const AppError = require('./../Utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    // Get tour data from collection
    const tours = await Tour.find();

    // Build template
    // Render that template using tour data
    res.status(200).render('overview', {
      title: 'All Tours',
      tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    // Get tour data from collection
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if(!tour) {
      return next(new AppError('There is no tour with that name', 404))
    }

    // Build template
    // Render that template using tour data
    res
      .status(200)
      .set(
        'Content-Security-Policy',
        'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com'
      )
      .render('tour', {
        title: `${tour.name} Tour`,
        tour,
      });
});

exports.getLoginForm = (req, res) => {
    res
      .status(200)
      .render('login', {
        title: 'Log into your account',
      })
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signUp', {
    title: 'Create a new account'
  })
};

exports.forgotPasswordPage = (req, res) => {
  res.status(200).render('forgot', {
    title: 'Forgot Password?'
  })
};

exports.resetPassword = (req, res) => {
  res.status(200).render('reset', {
    title: 'Reset Password'
  })
};

exports.getAccount = (req, res) => {
    res
    .status(200)
    .render('account', {
      title: 'Your account',
    })
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1 Find all bookings
  const bookings = await Booking.find({ user: req.user.id })

  // 2 Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs }});

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });

});

exports.updateUserData = catchAsync( async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.user.id, {
    name: req.body.name,
    email: req.body.email
  },
  {
    new: true,
    runValidators: true
  }
  );

  res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
  });
});