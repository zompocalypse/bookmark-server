const {v4: uuid } = require('uuid');

const bookmarks = [
  {
    id: 'd479b369-f37e-4e91-9ab6-eda979edb9d7',
    title: 'Google',
    url: 'http://www.google.com',
    rating: '3',
    desc: 'Internet-related services and products.'
  },
  {
    id: 'd479b369-f37e-4e91-9ab6-eda979edb9d3',
    title: 'Thinkful',
    url: 'http://www.thinkful.com',
    rating: '5',
    desc: '1-on-1 learning to accelerate your way to a new high-growth tech career!'
  },
  {
    id: '1ed71f6c-4401-4b49-b040-d02726f18b76',
    title: 'Github',
    url: 'http://www.github.com',
    rating: '4',
    desc: 'brings together the world\'s largest community of developers.'
  }
];

module.exports = { bookmarks };