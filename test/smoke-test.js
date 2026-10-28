const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const assert = require('assert');

const PORT = 4321; // окремий порт, щоб не конфліктувати з запущеним вручну сервером
const BASE_URL = `http://localhost:${PORT}`;
const SERVER_PATH = path.join(__dirname, '..', 'src', 'server.js');

const tests = [
  { name: 'GET /', url: '/', expectStatus: 200, expectContains: 'Express + PUG + EJS Demo' },
  { name: 'GET /users (PUG, список)', url: '/users', expectStatus: 200, expectContains: 'Список користувачів' },
  { name: 'GET /users/1 (PUG, деталі)', url: '/users/1', expectStatus: 200, expectContains: 'Email' },
  { name: 'GET /users/9999 (неіснуючий користувач)', url: '/users/9999', expectStatus: 404, expectContains: 'не знайдено' },
  { name: 'GET /articles (EJS, список)', url: '/articles', expectStatus: 200, expectContains: 'Список статей' },
  { name: 'GET /articles/1 (EJS, деталі)', url: '/articles/1', expectStatus: 200, expectContains: 'Автор:' },
  { name: 'GET /articles/9999 (неіснуюча стаття)', url: '/articles/9999', expectStatus: 404, expectContains: 'не знайдено' },
  { name: 'GET /css/style.css (статичні файли)', url: '/css/style.css', expectStatus: 200, expectContains: 'body' },
  { name: 'GET /random-page (404)', url: '/random-page', expectStatus: 404, expectContains: 'Сторінку не знайдено' }
];

function get(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      })
      .on('error', reject);
  });
}

function waitForServer(url, retries = 20, delayMs = 300) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      http
        .get(url, (res) => {
          res.resume();
          resolve();
        })
        .on('error', () => {
          if (remaining <= 0) {
            reject(new Error('Сервер не відповів вчасно'));
          } else {
            setTimeout(() => attempt(remaining - 1), delayMs);
          }
        });
    };
    attempt(retries);
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const { status, body } = await get(BASE_URL + test.url);
      assert.strictEqual(
        status,
        test.expectStatus,
        `очікувався статус ${test.expectStatus}, отримано ${status}`
      );
      if (test.expectContains) {
        assert.ok(
          body.includes(test.expectContains),
          `очікувався фрагмент "${test.expectContains}" у відповіді`
        );
      }
      console.log(`✅ PASS — ${test.name}`);
      passed += 1;
    } catch (err) {
      console.log(`❌ FAIL — ${test.name}`);
      console.log(`   ${err.message}`);
      failed += 1;
    }
  }

  console.log('');
  console.log(`Підсумок: ${passed} пройдено, ${failed} провалено (з ${tests.length})`);

  return failed === 0;
}

function main() {
  console.log(`Запуск сервера на порту ${PORT}...`);

  const server = spawn('node', [SERVER_PATH], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe'
  });

  let serverOutput = '';
  server.stdout.on('data', (chunk) => (serverOutput += chunk));
  server.stderr.on('data', (chunk) => (serverOutput += chunk));

  const cleanup = (exitCode) => {
    server.kill();
    process.exit(exitCode);
  };

  waitForServer(BASE_URL + '/')
    .then(async () => {
      console.log('Сервер запущено, виконую перевірки...\n');
      const allPassed = await runTests();
      cleanup(allPassed ? 0 : 1);
    })
    .catch((err) => {
      console.error('Не вдалося дочекатися запуску сервера:', err.message);
      console.error('Вивід сервера:\n', serverOutput);
      cleanup(1);
    });
}

main();
