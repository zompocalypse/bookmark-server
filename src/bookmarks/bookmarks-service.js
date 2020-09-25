const BookmarksService = {
  getAllBookmarks(db) {
    return db.select('*').from('bookmarks');
  },
  getById(db, id) {
    return db.from('bookmarks').select('*').where('id', id).first();
  },
  insertBookmark(db, newBookmark) {
    return db
      .insert(newBookmark)
      .into('bookmarks')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteBookmark(db, id) {
    return db
      .from('bookmarks')
      .where({ id })
      .delete();
  },
  updateBookmark(db, id, newBookmarkFields) {
    return db('bookmarks')
      .where({ id })
      .update(newBookmarkFields);
  }
};

module.exports = BookmarksService;