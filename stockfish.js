const os = require('os');
const platform = os.platform().replace('32', '');
const filename = `./bin/stockfish_${platform}_${process.arch}${platform === 'win' ? '.exe' : ''}`;

const engine = require('child_process').spawn(filename, {
    shell: false
});

let queue = [];


engine.stdout.on('data', function(m) {
    m.toString().split('\n').forEach(function(l) {
        if(l === '') return;
        console.debug('STOCKFISH >>', l);
        queue.push(l);
    });
});


function send(line) {
    console.debug('STOCKFISH <<', line);
    engine.stdin.write(line+'\n');
}

function recv() {
    return new Promise(function (resolve) {
        if (queue.length > 0) return resolve(queue.shift());
        let int = setInterval(function () {
            if (queue.length < 1) return;
            resolve(queue.shift());
            clearInterval(int);
            return;
        }, 100);
    });
}

function recvUntil(until) {
    return new Promise(async function (resolve) {
        let line = '';
        while (!line.startsWith(until)) {
            line = await recv();
        }

        resolve(line);
    });
}


async function getBestMove(board, moves) {
    let cmd = board;
    if (board != 'startpos') {
        cmd = 'fen ' + board;
    }
    if (moves) {
        cmd += ' moves ' + moves;
    }

    send('position ' + cmd);
    send('go movetime 1000'); // TODO: Make config option

    let line = await recvUntil('bestmove');
    if (line === 'bestmove (none)') return false;
    let from = line.split(' ')[1].substr(0, 2);
    let to = line.split(' ')[1].substr(2, 2);


    return [from, to];
}

async function moveRandomPiece(board) {
    // moves a chess piece to a random spot (check if it can actually move there)
    let cmd = board;
    if (board != 'startpos') {
        cmd = 'fen ' + board;
    }
    send('position ' + cmd);
    send('go movetime 1000'); // TODO: Make config option
    let line = await recvUntil('worstmove');
    if (line === 'worstemove (none)') return false;
    let from = line.split(' ')[1].substr(0, 2);
    let to = line.split(' ')[1].substr(2, 2);
    return [from, to];

}

module.exports = { getBestMove, moveRandomPiece };

