const express = require('express');
const bookmarksRouter = express.Router();
const logger = require('../logger');
const xss = require('xss');
const { v4: uuid } = require('uuid');
const BookmarksService = require('./bookmarks-service');

const { bookmarks } = require('../dataStore');
const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: xss(bookmark.url),
  description: xss(bookmark.description),
  rating: xss(bookmark.rating)
});

bookmarksRouter
  .route('/')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark));
      })
      .catch(next);
  })
  .post(express.json(), (req, res, next) => {
    const { title, url, rating, description } = req.body;
    const newBookmark = { title, url, rating, description };

    for (const [key, value] of Object.entries(newBookmark))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
    
    BookmarksService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        res
          .status(201)
          .location(`/bookmarks/${bookmark.id}`)
          .json(serializeBookmark(bookmark));
      })
      .catch(next);
  });


bookmarksRouter
  .route('/:id')
  .all((req, res, next)=>{
    BookmarksService.getById(
      req.app.get('db'), 
      req.params.id
    )
      .then(bookmark => {
        if(!bookmark) {
          return res.status(404).json({
            error: { message: 'Bookmark does not exist' }
          });
        }
        res.bookmark = bookmark;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeBookmark(res.bookmark));
  })
  .delete((req,res, next) =>{
    BookmarksService.deleteBookmark(
      req.app.get('db'),
      req.params.id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });
    
  

module.exports = bookmarksRouter;