const {WebSocketServer} = require('ws');
const {uuidv4} = require('uuid');
const ChessGame = require('./lib/ChessGame');

class App {
    constructor() {
        this._webSocketServer = null;
        this._onConnection = this._onConnection.bind(this);
        this._games = {};
    }

    start(port) {
        this._webSocketServer = new WebSocketServer({port});
        this._webSocketServer.on('connection', this._onConnection);
    }

    _onConnection(webSocketClient) {
        webSocketClient.id = uuidv4();
        webSocketClient.on('message', this._onMessage.bind(this, webSocketClient));
    }

    _onMessage(webSocketClient, messageText) {
        let message = null;
        try {
            message = JSON.parse(messageText);
        } catch (error) {
            console.error(`not json message: ${messageText}`);
            return;
        }

        switch (message.event) {
            case 'getGameList': {
                const gameList = Object.keys(this._games);
                webSocketClient.send(JSON.stringify(gameList));
                return;
            }
            case 'createGame': {
                const game = new ChessGame(webSocketClient);
                const gameId = uuidv4();
                this._games[gameId] = game;

                webSocketClient.send(JSON.stringify({
                    event: 'newGame',
                    data: {gameId}
                }));
                return;
            }
            case 'joinGame': {
                const gameId = message.data?.gameId;
                const game = this._games[gameId];

                if (game) {
                    game.start(webSocketClient);
                    webSocketClient.send(JSON.stringify(''));
                }
            }
        }
    }
}

const port = process.env.PORT || 8081;
const app = new App();
app.start(port);
