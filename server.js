const dotenv = require('dotenv');
const mongoose = require('mongoose');

//Handling Errors outside Express
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message, err);
  console.log('uncaught Rejection 🧨 Shutting down');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection succesfull'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//Handling Errors outside Express
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection 🧨 Shutting down');
  server.close(() => {
    process.exit(1);
  });
});
