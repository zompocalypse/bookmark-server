const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks.fixtures');

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

  describe('Unauthorized requests', () => {
    it('sends 401 Unauthorized for GET /api/bookmarks', () => {
      return supertest(app)
        .get('/api/bookmarks')
        .expect(401, { error: 'Unauthorized request' });
    });
    it('sends 401 unauthorized for GET /api/bookmarks/:id', () => {
      const bookmarkId = 2;
      return supertest(app)
        .get(`/api/bookmarks/${bookmarkId}`)
        .expect(401, { error: 'Unauthorized request' });
    });
  });

  describe('GET "/api/bookmarks"', () => {
    context('No bookmarks in "bookmarks" table', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/bookmarks')
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
          .get('/api/bookmarks')
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .expect(200, testBookmarks);
      });
    });

    context(`Given an XSS attack bookmark`, () => {
      const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

      beforeEach('insert malicious bookmark', () => {
        return db
          .into('bookmarks')
          .insert([ maliciousBookmark ]);
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/bookmarks`)
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedBookmark.title);
            expect(res.body[0].url).to.eql(expectedBookmark.url);
            expect(res.body[0].description).to.eql(expectedBookmark.description);
          });
      });
    });
  });

  describe('GET "/api/bookmarks/:bookmark_id"', () => {
    context('No bookmarks in "bookmarks" table', () => {
      it('responds with 404', () => {
        const bookmarkId = 987654;
        return supertest(app)
          .get(`/api/bookmarks/${bookmarkId}`)
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
          .get(`/api/bookmarks/${bookmarkId}`)
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .expect(200, expectedBookmark);
      });
    });

    context(`Given an XSS attack bookmark`, () => {
      const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

      beforeEach('insert malicious bookmark', () => {
        return db
          .into('bookmarks')
          .insert([ maliciousBookmark ]);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/bookmarks/${maliciousBookmark.id}`)
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedBookmark.title);
            expect(res.body.url).to.eql(expectedBookmark.url);
            expect(res.body.description).to.eql(expectedBookmark.description);
          });
      });
    });
  });

  describe('POST "/api/bookmarks"', () => {
    it('creates a bookmark, responding with 201 and the new bookmark', () => {
      this.retries(3);
      const newBookmark = {
        title: 'Test new Bookmark',
        url: 'http://testnewbookmark.com',
        description: 'Description for new bookmark',
        rating: '4'
      };
      
      return supertest(app)
        .post('/api/bookmarks')
        .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newBookmark.title);
          expect(res.body.url).to.eql(newBookmark.url);
          expect(res.body.description).to.eql(newBookmark.description);
          expect(res.body.rating).to.eql(newBookmark.rating);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`);
        })
        .then(res =>
          supertest(app)
            .get(`/api/bookmarks/${res.body.id}`)
            .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
            .expect(res.body)
        );
    });
  });

  describe('DELETE "/api/bookmarks/:id"', () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456;
        return supertest(app)
          .delete(`/api/bookmarks/${bookmarkId}`)
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .expect(404, { error: { message: `Bookmark does not exist` } });
      });
    });

    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks);
      });

      it('responds with 204 and removes the bookmark', () => {
        const idToRemove = 2;
        const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
        return supertest(app)
          .delete(`/api/bookmarks/${idToRemove}`)
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/bookmarks`)
              .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
              .expect(expectedBookmarks)
          );
      });
    });
  });

  describe('PATCH /api/bookmarks/:id', () => {
    context('No bookmarks in "bookmarks" table', () => {
      it('responds with 404', () => {
        const bookmarkId = 987654;
        return supertest(app)
          .patch(`/api/bookmarks/${bookmarkId}`)
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .expect(404, { error: { message: `Bookmark does not exist`} });
      });
    });

    context('Bookmarks exist in "bookmarks" table', () => {
      const testBookmarks = makeBookmarksArray();

      beforeEach('insert articles', () => {
        return db 
          .into('bookmarks')
          .insert(testBookmarks);
      });

      it('responds with 204 and updates the bookmark', () => {
        const idToUpdate = 2;
        const updateBookmark = {
          title: 'updated bookmark title',
          url: 'http://updatedurl.com',
          description: 'updated description',
          rating: "5"
        };
        const expectedBookmark = {
          ...testBookmarks[idToUpdate - 1],
          ...updateBookmark
        }
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .send(updateBookmark)
          .expect(204)
          .then( res =>
            supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
              .expect(expectedBookmark)
          );
      });
      it('responds with 400 when no required fields supplied', () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain either 'title', 'url', 'description' or 'rating'`
            }
          });
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateBookmark = {
          title: 'updated bookmark title',
        };
        const expectedBookmark = {
          ...testBookmarks[idToUpdate - 1],
          ...updateBookmark
        };
  
        return supertest(app)
          .patch(`/api/bookmarks/${idToUpdate}`)
          .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
          .send({
            ...updateBookmark,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
        .then(res =>
            supertest(app)
              .get(`/api/bookmarks/${idToUpdate}`)
              .set({ 'Authorization': `Bearer ${process.env.API_TOKEN}` })
              .expect(expectedBookmark)
          );
      });
    });
  });
});