const Tour = require('./../Models/tourModel');
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

exports.getAccount = (req, res) => {
    res
    .status(200)
    .render('account', {
      title: 'Your account',
    })
};