const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const fs = bluebird.promisifyAll(require('fs'));

const neweggEndpoint = 'http://apis.rtainc.co/newegg/item/';

function getItemNumbers() {
  return fs.readFileAsync('itemlist', 'utf-8')
}

function listifyItems (items) {
  const itemsArray = items.split('\n');
  itemsArray.pop();
  return itemsArray;
}

function getItemInfo(items) {
  return bluebird.all(items.map(requestPromise))
}

function requestPromise(item) {
  return request.getAsync(`${neweggEndpoint}${item}`)
}

function printResults(responses) {
  const jsonBodies = responses.map(res => JSON.parse(res.body))

  console.log('In stock:\n')
  jsonBodies.filter(res => res.in_stock)
    .forEach(printItem);

  console.log('Sold out:\n');
  jsonBodies.filter(res => !res.in_stock)
    .forEach(printItem);
}

function printItem(item) {
  console.log(`${item.name}\n\turl: ${item.url}\n`)
}

function getItemStockReport() {
  getItemNumbers()
    .then(listifyItems)
    .then(getItemInfo)
    .then(printResults);
}

getItemStockReport();

exports.myHandler = getItemStockReport;


