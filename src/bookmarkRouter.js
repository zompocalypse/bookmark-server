const express = require('express');
const bookmarkRouter = express.Router();
const logger = require('./logger');

const { bookmarks } = require('./dataStore');


bookmarkRouter
  .route('/')
  .get((req, res) =>
    res.json(bookmarks));


    bookmarkRouter
    .route('/:id')
    .get((req, res)=>{
      const{id}=req.params
      const bookmark= bookmarks.find(bookmark => bookmark.id === id)
      if(!bookmark){
      return res.status(400,'Book id is not valid')
      }
      res.json(bookmark)
    })
    

module.exports = bookmarkRouter;