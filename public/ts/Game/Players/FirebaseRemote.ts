import Player from "./Player.js";
import Move from "../utils/Move.js";
import Human from "./Human.js";
import Turn from "../utils/Turn.js";
import App from "../../App/App.js";
import Game from "../Game/Game.js";
import Board from "../Game/Board.js";

export default class FirebaseRemote extends Player {
	constructor(turn: Turn, game: Game, board: Board, public user: userInfo) {
		super(turn, game, board);
		this.init()
	}

	private async init() {
		const docRef = this.game.db.collection('users').doc(this.user.userid);
		const docResponse = await docRef.get();
		const docData = docResponse.data();

		if(!docData.online) this.disconnected();
		
		docRef.onSnapshot(doc => {
			if(!doc.data().online) this.disconnected();
		});
	}

	public move(): Promise<Move> {
		return new Promise<Move>(resolve => {
			const docRef = this.game.docRef
			
			const unsubscribe = docRef.onSnapshot(doc => {
				const board = doc.data().board
				
				for(let y = 0; y < this.board.matrix.length; y++) {
					for(let x = 0; x < this.board.matrix.length; x++) {
						if(board[y][x] != this.board.matrix[y][x] && board[y][x] === this.turn) {
							const move = new Move(x, y, board[y][x])

							resolve(move)
							unsubscribe()
						}
					}
				}
			})
		})
	}

	private disconnected() {
		this.game.setLooser(this, `${this.user.username} disconnected from game. You won!`);
	}
}