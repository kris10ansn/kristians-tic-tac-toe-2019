import Router from "./Router.js";
import LobbyManager from "./LobbySelector/LobbyManager.js";
import GameCreator from "./CreateGame/GameCreator.js";
import Player from "../Game/Players/Player.js";
import Game from "../Game/Game/Game.js";
import AuthHandler from "./Auth/AuthHandler.js";
import FirebaseRemote from "../Game/Players/FirebaseRemote.js";
import ConnectionHandler from "./ConnectionHandler.js";

declare global { const firebase }

export default class App {
	private app = firebase.app();
	private db  = firebase.firestore();

	private router = new Router();
	private authHandler = new AuthHandler(this.db);
	private lobbyManager = new LobbyManager('div.lobbies', this.db.collection('lobbies'), this);
	private gameCreator = new GameCreator('div.create-game', this.db.collection('lobbies'), this);
	private connectionHandler = new ConnectionHandler(this);

	public game: Game = null
	
	constructor() {
		const gameDiv = document.querySelector('div.game');
		gameDiv.addEventListener('Router.deactivated', e => {
			this.game = null;

			const boardDiv = gameDiv.querySelector('div.board')
			while(boardDiv.lastChild) {
				boardDiv.removeChild(boardDiv.lastChild)
			}
		});
		
		this.authHandler.authChange = (user) => {
			if(user !== null) {
				this.router.navigate('lobby-selector');
				this.authHandler.authChange = null;
			} else {
				this.router.navigate('log-in')
			}
		}
	}

	public createGame({ p1, p2, id }) {
		const online = p1 === FirebaseRemote || p2 === FirebaseRemote;
		let docRef = null;
		
		if(online) {
			docRef = this.db.collection('games').doc(id)
			docRef.set({}, { merge: true })
		}
		
		this.game = new Game(p1, p2, docRef, this.db, this)

		this.router.navigate('game')
	}

	public get user() { return this.authHandler.user }
	public get connected() { return this.connectionHandler.connected }

	public addDisconnectEvent(f: () => void) {
		this.connectionHandler.addDisconnectEvent(f);
	}
	public addReconnectEvent(f: () => void) {
		this.connectionHandler.addReconnectEvent(f);
	}
}