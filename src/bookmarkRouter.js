const express = require('express');
const bookmarksRouter = express.Router();
const logger = require('./logger');
const { v4: uuid } = require('uuid');
const BookmarksService = require('./bookmarks-service');

const { bookmarks } = require('./dataStore');

bookmarksRouter
  .route('/')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks);
      })
      .catch(next);
  })
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


bookmarksRouter
  .route('/:id')
  .get((req, res, next)=>{
    BookmarksService.getById(req.app.get('db'), req.params.id)
      .then(bookmark => {
        if(!bookmark) {
          return res.status(404).json({
            error: { message: `Bookmark does not exist` }
          });
        }
        res.json(bookmark);
      })
      .catch(next);
  })
  .delete((req,res) =>{
    const{id}=req.params;

    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id === id);
    if (bookmarkIndex === -1) {
      logger.error(`bookmark with id ${id} not found.`);
      return res
        .status(404)
        .send('Not found');
      
    }
    bookmarks.splice(bookmarkIndex,1);
    res.status(204).send('deleted');
  });
    
  

module.exports = bookmarksRouter;