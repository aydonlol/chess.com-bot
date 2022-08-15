const puppeteer = require('./puppeteer');
const stockfish = require('./stockfish');
const config = require('./config');




config.cookies.forEach(function (cookie) {
    let chess = new puppeteer(cookie);
    chess.init();

    chess.on('board', async function (fen, b) {
        if (!b) return;
        let bestmove = await stockfish.getBestMove(fen);
        await chess.move(bestmove[0], bestmove[1]);
       
        
    });
});

