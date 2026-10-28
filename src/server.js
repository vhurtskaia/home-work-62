const express = require('express');
const path = require('path');

const users = require('../data/users');
const articles = require('../data/articles');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.engine('ejs', require('ejs').__express);

app.use('/css', express.static(path.join(__dirname, 'css')));

app.get('/', (req, res) => {
  res.send(`
      <main class="container">
        <h1 class="page-title">Express + PUG + EJS Demo</h1>
        <ul>
          <li><a class="back-link" href="/users">/users</a> — список користувачів (PUG)</li>
          <li><a class="back-link" href="/articles">/articles</a> — список статей (EJS)</li>
        </ul>
      </main>
`
  );
});

// ====================== PUG ======================

app.get('/users', (req, res) => {
  res.render('users/index.pug', {
    title: 'Список користувачів',
    users
  });
});

app.get('/users/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).render('users/index.pug', {
      title: 'Список користувачів',
      users,
      error: `Користувача з id=${userId} не знайдено.`
    });
  }

  res.render('users/show.pug', {
    title: `Користувач: ${user.name}`,
    user
  });
});

// ====================== EJS ======================

app.get('/articles', (req, res) => {
  res.render('articles/index.ejs', {
    title: 'Список статей',
    articles
  });
});

app.get('/articles/:articleId', (req, res) => {
  const articleId = parseInt(req.params.articleId, 10);
  const article = articles.find((a) => a.id === articleId);

  if (!article) {
    return res.status(404).render('articles/index.ejs', {
      title: 'Список статей',
      articles,
      error: `Статтю з id=${articleId} не знайдено.`
    });
  }

  res.render('articles/show.ejs', {
    title: article.title,
    article
  });
});

app.use((req, res) => {
  res.status(404).send('<h1>404 — Сторінку не знайдено</h1><a href="/">На головну</a>');
});

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});
