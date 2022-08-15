const puppeteer = require('puppeteer-core');
const { EventEmitter } = require('events');
const { browserCfg } = require('./config');
let browser;

module.exports = class Puppeteer extends EventEmitter {
    constructor(cookie) {
        super();
        this.cookie = cookie;
    }

    async init() {
        if (!browser) browser = await puppeteer.launch(browserCfg);

        this.page = await browser.newPage();
        await this.page.setCookie({
            name: 'PHPSESSID',
            value: this.cookie,
            domain: '.chess.com',
            url: 'https://www.chess.com/',
            httpOnly: true,
            secure: true
        });

        await this.page.setViewport({ width: 1366, height: 768 });
        await this.page.goto('https://www.chess.com/play/online');
        // premium bullshit
        if (!! await this.page.$('.modal-trial-footer > button')) {
            await this.page.click('.modal-trial-footer > button');
        }
        // chess computer
        if (!! await this.page.$('.modal-seo-close-icon')) {
            await this.page.click('.modal-seo-close-icon');
        }

        // just to make sure
        await this.page.waitForSelector('.ui_v5-button-primary');
        await this.page.click('.ui_v5-button-primary');

        // wait until .game is defined
        await this.page.waitForFunction(() => {
            let bElem = document.getElementsByTagName('chess-board')[0];
            return (bElem && bElem.game);
        });

        this.currBoard = '';
        setInterval(() => this.loop(), 50);
    }

    async board() {
        return await this.page.evaluate(() => {
            let bElem = document.getElementsByTagName('chess-board')[0];
            if (!bElem || !bElem.game) return false;
            return bElem.game.getFEN() || false;
        });
    }

    async move(from, to) {
        return await this.page.evaluate((from, to) => {
            let bElem = document.getElementsByTagName('chess-board')[0];
            if (!bElem || !bElem.game) return false;

            let data = {
                animate: false,
                color: bElem.game.getPlayingAs(),
                from,
                to,
                userGenerated: true,
                userGeneratedDrop: true
            };

            if (to.substr(1, 1) === (data.color === 1 ? '8' : '1')) {
                let piece = bElem.game.getPiece(from);
                if (!piece) return;
                if (piece.type != 'p') {
                    data.flags = 0;
                } else {
                    data.flags = 8;
                    data.promotion = 'q';
                }
            }

            bElem.game.move(data);

            return true;
        }, from, to);
    }


    async rejoin() {
        // TODO: Make this work
        await this.page.click('.live-game-buttons-game-over > .ui_v5-button-primary');

        await this.page.waitForFunction(() => {
            let bElem = document.getElementsByTagName('chess-board')[0];
            return (bElem && bElem.game);
        });

        await this.page.waitForTimeout(1000);
    }

    async loop() {
        let board = await this.board();
        if (!board) return await this.rejoin();

        if (this.currBoard === board) return;
        this.currBoard = board;

        let botTurn = await this.page.evaluate(() => {
            let bElem = document.getElementsByTagName('chess-board')[0];
            return bElem.game.getPlayingAs() === bElem.game.getTurn();
        });

        this.emit('board', board, botTurn);
    }
};