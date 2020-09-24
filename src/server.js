const app = require('./app');
const { PORT, NODE_ENV, DB_URL } = require('./config');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: DB_URL
});

app.set('db', db);

app.listen(PORT, () => console.log(
  `Server running in ${NODE_ENV} mode on ${PORT}`
));