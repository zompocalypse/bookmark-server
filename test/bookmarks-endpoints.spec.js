const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe('Bookmarks Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('bookmarks').truncate());

  afterEach('cleanup', () => db('bookmarks').truncate());

  describe('GET /bookmarks', () => {
    context('No bookmarks in "bookmarks" table', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/bookmarks')
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .expect(200, []);
      });
    });
    context('Bookmarks exist in "bookmarks" table', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks);
      });

      it('responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/bookmarks')
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .expect(200, testBookmarks);
      });
    });
  });

  describe('GET "/bookmarks/:bookmark_id"', () => {
    context('No bookmarks in "bookmarks" table', () => {
      it('responds with 404', () => {
        const bookmarkId = 987654;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .expect(404, { error: { message: 'Bookmark does not exist'} });
      });
    });

    context('Bookmarks exist in "bookmarks" table', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks);
      });

      it('responds with 200 and the specific bookmark', () => {
        const bookmarkId = 2;
        const expectedBookmark = testBookmarks[bookmarkId - 1];

        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .expect(200, expectedBookmark);
      });
    });
  });

});