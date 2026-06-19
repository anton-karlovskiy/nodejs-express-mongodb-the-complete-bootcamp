import { EventEmitter } from 'events';
import http from 'http';

class Sales extends EventEmitter {}

const myEmitter = new Sales();

myEmitter.on('newSale', () => {
  console.log('There was a new sale!');
});

myEmitter.on('newSale', () => {
  console.log('Customer name: Jonas');
});

myEmitter.on('newSale', (stock: number) => {
  console.log(`There are now ${stock} items left in stock.`);
});

myEmitter.emit('newSale', 9);

//////////////////

const server = http.createServer();

server.on('request', (_req, res) => {
  console.log('Request received!');
  res.end('Request received');
});

server.on('request', () => {
  console.log('Another request');
});

server.on('close', () => {
  console.log('Server closed');
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Waiting for requests...');
});
