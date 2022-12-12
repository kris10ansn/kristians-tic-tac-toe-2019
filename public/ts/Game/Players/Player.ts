import Move from "../utils/Move.js";
import Turn from "../utils/Turn.js";
import Board from "../Game/Board.js";
import Game from "../Game/Game.js";
import App from "../../App/App.js";

export default abstract class Player {
	public abstract async move(): Promise<Move>;

	constructor(
		public readonly turn: Turn,
		protected game: Game,
		protected board: Board, ...excess
	) {}
}