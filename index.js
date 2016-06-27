const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const fs = bluebird.promisifyAll(require('fs'));
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport(`smtps://stevenchambersexe%40gmail.com:${process.argv[2]}@smtp.gmail.com`)

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
}

function printItem(item) {
  console.log(`${item.name}\n\turl: ${item.url}\n`)
  sendMail(item);
}

function sendMail(item) {
  const mailOpts = {
    from: '"you" <yourRunningDeamon@domain.com>',
    to: "stevenchambers.exe@gmail.com",
    subject: 'GTX 1070 available',
    text: `Buy this card now! name: ${item.name} url: ${item.url}`
  }
  transporter.sendMail(mailOpts, (err, info) => {
    if (err) {
      return console.log(err);
    }
    console.log(`message sent: ${info.response}`);
  })
}

function getItemStockReport() {
  getItemNumbers()
    .then(listifyItems)
    .then(getItemInfo)
    .then(printResults);
}

getItemStockReport();
setInterval(getItemStockReport, 60*1000);

exports.myHandler = getItemStockReport;


