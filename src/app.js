require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const validateBearerToken = require('./validateBearerToken');
const errorHandler = require('./errorHandler');
const bookmarkRouter = require('./bookmarkRouter');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(cors());
app.use(morgan(morganOption));
app.use(helmet());
app.use(validateBearerToken);
app.use('/bookmark', bookmarkRouter);

app.get('/', (req, res) => {
  res.send('Use the /bookmarks endpoint');
});

app.use(errorHandler);

module.exports = app;