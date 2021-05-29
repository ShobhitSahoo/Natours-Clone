const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../Models/userModel');
const catchAsync = require('./../Utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../Utils/email');

const signToken = id => {
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET, 
        { expiresIn: "90d" }
        )
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = { 
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    user.password = undefined;

    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    // const newUser = await User.create(req.body);
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });
    
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if ( !email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    // const correct = await user.correctPassword(password, user.password);

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password provided', 401));
    }

    // 3) If everything is OK, send token to client
    createSendToken(user, 200, res);
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token,
    //     message: "logged in"
    // });
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
}

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting the token and check if it exists
    const auth = req.headers.authorization;
    let token;
    if(auth && auth.startsWith('Bearer')) {
        token = auth.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if(!token) {
        return next(new AppError('You are not logged in. Please log in to get access', 401));
    }
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user exists 
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppError('The user belonging to this token does not exist', 401));
    }

    // 4) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please login again.', 401));
    }
    //Granted access to the route
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});


// Only to render pages
exports.isLoggedIn = async (req, res, next) => {  
    // Getting the token and check if it exists
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    
            // Check if user exists 
            const currentUser = await User.findById(decoded.id);
            if(!currentUser) {
                return next();
            }
    
            // Check if user changed password after token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }
            // User successfully logged in
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to access this', 403));
        }
        next();
    };
};

exports.forgetPassword = catchAsync (async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
        return next(new AppError('There is no user with this email address', 404));
    }

    // Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/vi/resetPassword/${resetToken}`;
        
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Reset token has been sent!'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined; 
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending password reset token. Please try again later.', 500));
    };
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired and there is user, set the new password
    if(!user) {
        next(new AppError('Token is invalid or expired. Please try again later.', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);

    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success, password changed',
    //     token,
    //     message: "logged in"
    // });
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) get user from collection
    const user = await User.findById(req.user.id).select('+password')

    // 2) Check if posted password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log the user in & send JWT
    createSendToken(user, 200, res);
})