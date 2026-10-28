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
    <!DOCTYPE html>
    <html lang="uk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Express + PUG + EJS Demo</title>
      <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
      <header class="site-header">
        <a class="logo" href="/">Express Demo</a>
        <nav>
          <a href="/users">Користувачі</a>
          <a href="/articles">Статті</a>
        </nav>
      </header>

      <main class="container">
        <h1 class="page-title">Express + PUG + EJS Demo</h1>
        <div class="card-grid">
          <a class="card" href="/users">
            <h2 class="card-title">/users</h2>
            <p class="card-text">Список користувачів (PUG)</p>
          </a>
          <a class="card" href="/articles">
            <h2 class="card-title">/articles</h2>
            <p class="card-text">Список статей (EJS)</p>
          </a>
        </div>
      </main>

      <footer class="site-footer">
        <p>© 2026 Express + PUG + EJS Demo</p>
      </footer>
    </body>
    </html>
  `);
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
