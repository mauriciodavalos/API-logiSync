const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const app = express();

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const rutaRouter = require('./routes/rutaRoutes');

console.log(process.env.NODE_ENV);

//1) GLOBAL MiddleWares
//Set security HTTP request
app.use(helmet());

//CORS
app.use(cors());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit request from same IP address
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  messaage: 'Too many request from this IP, please try again in an hour',
});

app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution params
app.use(
  hpp({
    whitelist: [
      'company',
      'vehicleType',
      'startPoint',
      'endPoint',
      'initialDate',
      'price',
    ],
  })
);

//Test Middleware
app.use(express.json());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//2) Handlers - Controllers

//3) Routes
app.use('/api/v1/rutas', rutaRouter);
app.use('/api/v1/users', userRouter);

//---Handling routes that are not defined
app.all('*', (req, res, next) => {
  next(new AppError(`Can´t find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

//4)START SERVER
module.exports = app;
