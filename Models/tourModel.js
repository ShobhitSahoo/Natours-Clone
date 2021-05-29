const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxLength: [40, 'A tour must have at most 40 characters'],
        minLength: [10, 'A tour must have at least 10 characters']
        // validate: [validator.isAlpha, 'Tour name must be only alphabets']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size'],
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty can be either easy or medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Ratings must be above 1.0'],
        max: [5, 'Ratings must be below 5.0'],
        set: val => Math.round(val*10) / 10
    },
    ratingsQuantity: { 
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            // this only works for current document creation, wont work with update function
            validator: function(val) {
                return val < this.price;
            },
            message: 'Discount price should be less than regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    // guides: Array
    guides: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ]
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// tourSchema.index({price: 1});
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration/7;
});

// Virtual populate 
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'

});

// Document middleware
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true});
    next();
});

tourSchema.pre('/^find/', function(next) {
    this.find({secretTour: {$ne: true}});
    this.start = Date.now();
    next();
});
tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next();
});

tourSchema.post('/^find/', function(docs, next) {
    console.log(`Query took ${Date.now()} - this.start milliseconds`);
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;