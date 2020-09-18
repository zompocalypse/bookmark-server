const express = require('express');
const bookmarkRouter = express.Router();
const logger = require('./logger');
const { v4: uuid } = require('uuid');

const { bookmarks } = require('./dataStore');


bookmarkRouter
  .route('/')
  .get((req, res) =>
    res.json(bookmarks))
  .post(express.json(), (req, res) => {
    const { title, url, rating, desc } = req.body;
    if (!title) {
      logger.error('title is required');
      return res
        .status(400)
        .send('title is required');
    }

    if (!url) {
      logger.error('url is required');
      return res
        .status(400)
        .send('url is required');
    }

    if (!rating) {
      logger.error('rating is required');
      return res
        .status(400)
        .send('rating is required');
    }

    if (!desc) {
      logger.error('desc is required');
      return res
        .status(400)
        .send('desc is required');
    }

    const id = uuid();
    const bookmark = {
      id,
      title,
      url,
      rating, 
      desc
    };

    bookmarks.push(bookmark);

    logger.info(`Bookmark created with id: ${id}`);

    res.send(201);
  });


bookmarkRouter
  .route('/:id')
  .get((req, res)=>{
    const{id}=req.params;
    const bookmark= bookmarks.find(bookmark => bookmark.id === id);
    if(!bookmark){
      return res.status(400,'Book id is not valid');
    }
    res.json(bookmark);
  });
    

module.exports = bookmarkRouter;