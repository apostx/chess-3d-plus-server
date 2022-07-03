const chess = require('chess');

class ChessGame {
    constructor() {
        this.playerWhite = null;
        this.playerBlack = null;

        this.logic = chess.create();
    }
}

module.exports = ChessGame;
