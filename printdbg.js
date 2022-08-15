// print debug
const cookie = require('./puppeteer.js')

function print(msg) {
    console.log([puppeteer.this.cookie] + ' ' + msg)
}

module.exports = print;
