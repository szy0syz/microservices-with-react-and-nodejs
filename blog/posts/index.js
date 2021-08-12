const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();
app.use(bodyParser.json());

const posts = {};

app.get('/posts', (_, res) => {
  res.send(posts);
});

app.post('/posts', (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;

  posts[id] = { id, title };

  res.status(201).send(posts[id]);
});

app.listen(4000, () => {
  console.log('Posts Service listening on 4000');
});
