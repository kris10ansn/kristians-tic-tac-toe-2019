import Human from "../../Game/Players/Human.js";
import FirebaseRemote from "../../Game/Players/FirebaseRemote.js";
import App from "../App.js";

export default class Lobby {
	private p1: { username: string }
	private p2: { username: string }

	public dom: HTMLDivElement

	constructor(private doc, private app: App) {
		const {p1, p2} = doc.data()
		this.p1 = p1
		this.p2 = p2

		this.createDOM()
	}
	
	private createDOM() {
		const waitingStyle = "color: green; font-weight: 700;"
		
		this.dom = elementFromString(`
			<div class="lobby" id="${this.doc.id}" title="Click to join!"><div class="info">
				<h2>${this.doc.data().title}</h2>
				<p>Player 1: 
					<span class="p1name" style="${ this.p1 == undefined? waitingStyle : "" }">
					${ !(this.p1 == undefined)? this.p1.username : "Waiting..." }
					</span>
				</p>
				<p>Player 2:
					<span class="p2name" style="${ this.p2 == undefined? waitingStyle : "" }">
					${ !(this.p2 == undefined)? this.p2.username : "Waiting..." }
					</span>
				</p>
			</div></div>
		`)

		this.dom.addEventListener("click", (event) => {
			const username = this.app.user.displayName || "Guest";
			const userid = this.app.user.uid;

			this.doc.ref
				.update({
					[this.p2? 'p1' : 'p2']: {
						username: username,
						userid: userid,
					}
				})

			this.app.createGame({
				p1: this.p1? FirebaseRemote : Human,
				p2: this.p2? FirebaseRemote : Human,
				id: this.doc.id
			})
		})
	}
}

function elementFromString<T>(str): T {
	const div = document.createElement('div');
	div.innerHTML = str.trim();
	return <T><unknown>div.firstChild; 
}