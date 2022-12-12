import Player from "./Player.js";
import Turn from "../utils/Turn.js";
import Move from "../utils/Move.js";
import Board from "../Game/Board.js";
import Matrix from "../utils/Matrix.js";

export default class Computer extends Player {
	// @override
	public async move(): Promise<Move> {
		return new Promise<Move>(async resolve => {
			setTimeout(() => {
				const move = this.getBestMove(this.board.matrix, this.turn)
				resolve(move)
			}, 500)
		})
	}

	private getBestMove(board: Matrix<number>, turn: Turn): Move {
		const w = Board.checkWin(board)

		if(w === this.turn) {
			return Move.score(10)
		} else if(w === ~this.turn) {
			return Move.score(-10)
		} else if(Board.checkDraw(board)) {
			return Move.score(0)
		}

		const testBoard = Matrix.copy(board)
		const moves = []

		testBoard.forEach((row, y) => {
			row.forEach((value, x) => {
				if(value === 0) {
					testBoard[y][x] = turn

					const move = new Move(x, y, turn)
					move.score = this.getBestMove(testBoard, ~turn).score

					moves.push(move)

					testBoard[y][x] = 0
				}
			})
		})
		
		let bestMove = moves[0]
		let bestScore = Infinity * (turn === this.turn? -1 : 1)
		
		moves.forEach(move => {
			if(
				(turn === this.turn && move.score > bestScore) || 
				(turn === ~this.turn && move.score < bestScore)
			) {
				bestMove = move
				bestScore = move.score
			}
		})

		return bestMove
	}
}