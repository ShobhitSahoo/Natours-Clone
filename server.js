const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting Down....');
    console.log(err.name, err.message, err.stack);
    process.exit(1);
});

dotenv.config({path: './config.env'})

const app = require('./app');


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true        // Added due a warning in terminal
}).then(() => console.log('DB connection successful!'));



// const testTour = new Tour({
//     name: 'The Camp Parker',
//     price: 997
// });

// testTour.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log('ERROR: ' + err);
// })

const port = 3000;
const server = app.listen(port, () => console.log(`App listening on port ${port}!`));

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION 🤯 Shutting Down....');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
}); 
