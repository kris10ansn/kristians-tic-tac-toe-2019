import Turn from "./Turn";

export default class Move {
	constructor(public x: number, public y: number, public turn: Turn, public score?: number) {}

	static score(score: number) {
		return new Move(null, null, null, score)
	}
}