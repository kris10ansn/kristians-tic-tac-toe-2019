import Move from "../utils/Move.js";
import Player from "./Player.js";


export default class Human extends Player {
	// @override
	public async move(): Promise<Move> {
		return new Promise(resolve => {
			this.board.cells.forEach((it, y) => <any>it.forEach((cell, x) => {
				// Add event listener to all cells (const listener function)
				const listener = () => {
					if(this.board.matrix[y][x] === 0) {
						// if move is valid, remove event listeners and resolve

						this.board.cells.forEach(it => 
							it.forEach(cell => cell.removeEventListener("click", listener)))

						resolve(new Move(x, y, this.turn))
					}
				}
				
				cell.addEventListener("click", listener)
			}))
		})
	}

	private disconnected() {
		this.game.setLooser(this, 'You disconnected from game..');
	}
}