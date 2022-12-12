import Matrix from "../utils/Matrix.js";
import Turn from "../utils/Turn.js";
import BoardState from "../utils/BoardState.js";
import Game from "./Game.js";

export default class Board {
	public matrix: Matrix<number> = Matrix<number>(3, 3, 0)
	public cells: Matrix<HTMLTableCellElement> = Matrix<HTMLTableCellElement>(3, 3, null)
	
	public state: BoardState = BoardState.Ongoing
	private winner: Turn = null
	
	private board: HTMLTableElement
	
	constructor(private game: Game, private online: boolean) {
		this.createDOM( document.querySelector("div.game div.board") )
	}

	
	public set({x, y, turn}) {
		this.matrix[y][x] = turn
		
		this.cells[y][x].classList.add( turn === Turn.Player1? "p1":"p2" )

		if(this.online) this.updateFirebase()
	}

	public highlight(turn: Turn) {
		if(turn === Turn.Player1) {
			this.board.classList.add("p1-win")
		} else if(turn === Turn.Player2) {
			this.board.classList.add("p2-win")
		} else {
			this.board.classList.add("draw")
		}
	}
	
	public async initFirebase() {
		const data = (await this.game.docRef.get()).data()
		let p1moves = 0
		let p2moves = 0

		if(!data || data.board === undefined) {
			this.updateFirebase()
		} else {
			for(let y = 0; y < this.matrix.length; y++) {
				for(let x = 0; x < this.matrix.length; x++) {
					const turn = data.board[y][x]
					if(turn !== 0) {
						this.set({ x: x, y: y, turn: turn })
						
						if(turn === Turn.Player1) p1moves++
						else if(turn === Turn.Player2) p2moves++
					}
				}
			}

			if(p1moves > p2moves) {
				this.game.turn = Turn.Player2
			} else if(p1moves === p2moves) {
				this.game.turn = Turn.Player1
			}
		}
	}

	private updateFirebase() {
		this.game.docRef.update({ board: Matrix.toObject(this.matrix) })
	}
	
	public checkWin(): Turn | null {
		let winner = this.state === BoardState.Won && this.winner? this.winner : Board.checkWin(this.matrix)
		
		if(winner) {
			this.state = BoardState.Won
			this.winner = winner
		}
		
		return winner
	}
	
	public static checkWin(board: Matrix<number>): Turn | null {
		if(board[0].every(value => value === Turn.Player1)) return Turn.Player1;
		if(board[1].every(value => value === Turn.Player1)) return Turn.Player1;
		if(board[2].every(value => value === Turn.Player1)) return Turn.Player1;
		
		if(board[0].every(value => value === Turn.Player2)) return Turn.Player2;
		if(board[1].every(value => value === Turn.Player2)) return Turn.Player2;
		if(board[2].every(value => value === Turn.Player2)) return Turn.Player2;

		if(board.every(row => row[0] === Turn.Player1)) return Turn.Player1;
		if(board.every(row => row[1] === Turn.Player1)) return Turn.Player1;
		if(board.every(row => row[2] === Turn.Player1)) return Turn.Player1;
		
		if(board.every(row => row[0] === Turn.Player2)) return Turn.Player2;
		if(board.every(row => row[1] === Turn.Player2)) return Turn.Player2;
		if(board.every(row => row[2] === Turn.Player2)) return Turn.Player2;
		
		if(board.every((row, i) => row[i] === Turn.Player1)) return Turn.Player1;
		if(board.every((row, i) => row[i] === Turn.Player2)) return Turn.Player2;

		if(board.every((row, i) => row[board.length-1-i] === Turn.Player1)) return Turn.Player1;
		if(board.every((row, i) => row[board.length-1-i] === Turn.Player2)) return Turn.Player2;

		return null
	}
	
	public checkDraw(): boolean {
		let drawn = this.state === BoardState.Drawn || Board.checkDraw(this.matrix)
		
		if(drawn) {
			this.state = BoardState.Drawn
		}
		
		return drawn
	}
	
	static checkDraw(board: Matrix<number>): boolean {
		if(Board.checkWin(board) !== null) {
			return false
		}
		
		let result = true
		
		board.forEach(row => row.forEach(value => {
			if(value === 0) {
				result = false
			}
		}))

		return result
	}

	private createDOM(parent: Element) {
		const table = createElement<HTMLTableElement>("table", "board")
	
		for(let y = 0; y < this.matrix.length; y++) {
			const row = createElement<HTMLTableRowElement>("tr", "row")
	
			for(let x = 0; x < this.matrix[0].length; x++) {
				const td = createElement<HTMLTableCellElement>("td", "cell")
				this.cells[y][x] = td
	
				row.appendChild(td)
			}
			table.appendChild(row)
		}
		parent.appendChild(table)
		this.board = table
		
		const statusWrapper = createElement<HTMLDivElement>		 ("div", "status-wrapper")
		const status 		= createElement<HTMLParagraphElement>("p", "status")
	
		statusWrapper.appendChild(status)
		parent.appendChild(statusWrapper)
	}
}

function createElement<T>(el: string, ...classes: string[]): T {
	const element = document.createElement(el)
	element.classList.add(...classes)

	return <T><unknown>element
}