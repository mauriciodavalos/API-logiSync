const express = require('express');
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require('cors');

const app = express();

const userRouter = require('./routes/userRoutes');
const rutaRouter = require('./routes/rutaRoutes');

console.log(process.env.NODE_ENV);

//1) MiddleWares
//CORS
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//2) Handlers - Controllers

//3) Routes
app.use('/api/v1/rutas', rutaRouter);
app.use('/api/v1/users', userRouter);

//4)START SERVER
module.exports = app;
