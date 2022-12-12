import Board from "./Board.js";
import Human from "../Players/Human.js";
import Turn from "../utils/Turn.js";
import Computer from "../Players/Computer.js";
import Player from "../Players/Player.js";
import FirebaseRemote from "../Players/FirebaseRemote.js";
import App from "../../App/App.js";
import BoardState from "../utils/BoardState.js";

type PlayerConstructor = typeof Human | typeof Computer | typeof FirebaseRemote;

export default class Game {
	public board: Board

	private player1: Player
	private player2: Player

	private running = true

	public turn = Turn.Player1

	constructor(
		P1: PlayerConstructor,
		P2: PlayerConstructor,
		public docRef, 
		public db,
		public app: App
	) {
		this.app.addDisconnectEvent(() => { this.onDisconnect() });
		this.init(P1, P2)
	}
	
	async init(P1: PlayerConstructor, P2: PlayerConstructor) {
		const online = (P1 === FirebaseRemote || P2 === FirebaseRemote)
		this.board = new Board(this, online)

		if(online) {
			await this.board.initFirebase()

			const lobbyRef = this.db.collection('lobbies').doc(this.docRef.id);
			const lobby = (await lobbyRef.get()).data();
			const opponentKey = P1 === FirebaseRemote? 'p1' : 'p2';

			if(lobby.p1 && lobby.p2) {
				this.start(P1, P2, lobby[opponentKey])
			} else {
				this.status("Waiting for opponent to join...")
				// If there isn't two players, check for updates until there is
				lobbyRef.onSnapshot(doc => {
					const data = doc.data()
					
					if(data.p1 && data.p2) {
						this.start(P1, P2, data[opponentKey]);
					}
				})
			}
		} else {
			this.start(P1, P2)
		}
	}

	private start(P1:PlayerConstructor, P2:PlayerConstructor, user = null) {
		this.player1 = new P1(Turn.Player1, this, this.board, user)
		this.player2 = new P2(Turn.Player2, this, this.board, user)

		this.loop()
	}
	
	async loop() {
		while(this.running) {
			const player = this.turn === this.player1.turn? this.player1 : this.player2
			
			this.status(`Waiting for ${this.getName(player)} to move`)
			
			const win = this.board.checkWin()
			if(win) {
				this.board.highlight(win)
				this.running = false

				const winner = win === this.player1.turn? this.player1 : this.player2;
				
				this.status(`${this.getName(winner, true)} won the game!`)

				return;
			} else if(this.board.checkDraw()) {
				this.board.highlight(null)
				this.status(`It's a draw!`)
				return;
			}

			const move = await player.move();

			if(this.running) this.board.set(move);
			
			this.turn = ~this.turn;
		}

		// TODO: ADD BACK TO LOBBY BUTTON
	}

	public setLooser(player: Player, message: string) {
		// Return if game is already done
		if(this.board.state !== BoardState.Ongoing)
			return;

		const winner = (player === this.player1? this.player2 : this.player1);
		this.board.highlight(winner.turn);
		this.status(message)
		this.running = false;

		this.board.state = BoardState.Won;
	}

	private draw(message: string) {
		// Return if game is already done
		if(this.board.state !== BoardState.Ongoing)
			return;

		this.board.highlight(null);
		this.status(message);
		this.running = false;
		
		this.board.state = BoardState.Drawn;
	}

	private onDisconnect() {
		this.draw('You disconnected from game..');
	}

	private getName(player: Player, capitalized = false) {
		const opponent = this.getFirebaseRemote(this.player1, this.player2);
		
		if(opponent !== null) {
			switch(player.constructor) {
				case Human:
					return `${capitalized?'Y':'y'}ou`;
				case FirebaseRemote:
					return opponent.user.username || "Guest";
			}
		} else if(this.player1.constructor.name === this.player2.constructor.name) {
			return `Player ${player.turn === Turn.Player1? 1 : 2}`
		} else {
			return `${player.constructor.name}`
		}
	}

	private getFirebaseRemote(player1: Player, player2: Player): FirebaseRemote {
		if(player1 instanceof FirebaseRemote)
			return player1;
		else if(player2 instanceof FirebaseRemote)
			return player2;
		else
			return null;
	}

	private getHuman(player1: Player, player2: Player): Human {
		if(player1 instanceof Human)
			return player1;
		else if(player2 instanceof Human)
			return player2;
		else
			return null;
	}

	private status(message: string) {
		document.querySelector("p.status").textContent = message
	}
}