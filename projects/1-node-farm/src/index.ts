import fs from 'fs';
import http from 'http';
import url from 'url';
import path from 'path';
import slugify from 'slugify';
import replaceTemplate, { Product } from './utils/replaceTemplate';

const overviewTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'template-overview.html'),
  'utf-8',
);
const cardTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'template-card.html'),
  'utf-8',
);
const productTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'template-product.html'),
  'utf-8',
);

const productsJson = fs.readFileSync(
  path.join(__dirname, '..', 'dev-data', 'data.json'),
  'utf-8',
);
const products: Product[] = JSON.parse(productsJson) as Product[];

const slugs = products.map(product => slugify(product.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url ?? '/', true);

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const cardsHtml = products.map(product => replaceTemplate(cardTemplate, product)).join('');
    const output = overviewTemplate.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);

    // Product page
  } else if (pathname === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const id = Number(Array.isArray(query.id) ? query.id[0] : query.id);
    const product = products[id];
    const output = replaceTemplate(productTemplate, product);
    res.end(output);

    // API
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(productsJson);

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
