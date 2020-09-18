const express = require('express');
const bookmarkRouter = express.Router();
const logger = require('./logger');

const { bookmarks } = require('./dataStore');

bookmarkRouter
  .route('/')
  .get((req, res) =>
    res.json(bookmarks));

module.exports = bookmarkRouter;