const BookmarksService = {
  getAllBookmarks(db) {
    return db.select('*').from('bookmarks');
  },
  getById(db, id) {
    return db.from('bookmarks').select().where('id', id).first();
  }
};

module.exports = BookmarksService;