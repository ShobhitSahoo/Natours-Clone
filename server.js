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

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`App listening on port ${port}!`));

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION 🤯 Shutting Down....');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
}); 

process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED 😒😒. Shutting down now!!!');
    server.close(() => {
        console.log('Process terminated! 👀👀');
    });
});