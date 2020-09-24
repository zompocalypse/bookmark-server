function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'First Bookmark',
      url: 'http://firstbookmark.com',
      description: 'Description for first bookmark',
      rating: '5'
    },
    {
      id: 2,
      title: 'Second Bookmark',
      url: 'http://secondbookmark.com',
      description: 'Description for second bookmark',
      rating: '5'
    },
    {
      id: 3,
      title: 'Third Bookmark',
      url: 'http://thirdbookmark.com',
      description: 'Description for third bookmark',
      rating: '5'
    },
    {
      id: 4,
      title: 'Fourth Bookmark',
      url: 'http://fourthbookmark.com',
      description: 'Description for fourth bookmark',
      rating: '5'
    }
  ];
}

module.exports = {
  makeBookmarksArray
};