import fs from 'fs';
import http from 'http';
import url from 'url';
import path from 'path';
import slugify from 'slugify';
import replaceTemplate, { Product } from './modules/replaceTemplate';

const tempOverview = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'template-overview.html'),
  'utf-8',
);
const tempCard = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'template-card.html'),
  'utf-8',
);
const tempProduct = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'template-product.html'),
  'utf-8',
);

const data = fs.readFileSync(path.join(__dirname, '..', 'dev-data', 'data.json'), 'utf-8');
const dataObj: Product[] = JSON.parse(data) as Product[];

const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url ?? '/', true);

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);

    // Product page
  } else if (pathname === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const id = Number(Array.isArray(query.id) ? query.id[0] : query.id);
    const product = dataObj[id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // API
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end('<h1>Page not found!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
