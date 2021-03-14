const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/todos', routes);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('App running on port', port);
});
