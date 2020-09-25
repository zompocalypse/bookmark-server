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

function makeMaliciousBookmark() {
  const maliciousBookmark = {
    id: 911,
    url: 'http://url.com - <script>alert("xss");</script>',
    rating: 5,
    title: 'Insert a malicious script <script>alert("xss");</script>',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. something <strong>normal</strong>.`
  }
  const expectedBookmark = {
    ...maliciousBookmark,
    url: 'http://url.com - &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    title: 'Insert a malicious script &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. something <strong>normal</strong>.`
  }
  return {
    maliciousBookmark,
    expectedBookmark,
  }
}

module.exports = {
  makeBookmarksArray,
  makeMaliciousBookmark
};