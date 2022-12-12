import App from "../App.js";
import FirebaseRemote from "../../Game/Players/FirebaseRemote.js";
import Human from "../../Game/Players/Human.js";
import Computer from "../../Game/Players/Computer.js";

declare global { type userInfo = { username: string, userid: string } }

export default class GameCreator {
	private root: HTMLDivElement;

	constructor(selector: string, private collection: any, private app: App) {
		this.root = document.querySelector(selector);

		this.addEventListeners()
	}
	private async createOnlineGame(
		lobbyObject: { title: string, time: number, p1?: userInfo, p2?: userInfo }
	){
		const id = (await this.collection.add(lobbyObject)).id
		const { p1, p2 } = lobbyObject
		
		this.app.createGame({
			p1: p1? Human : FirebaseRemote,
			p2: p2? Human : FirebaseRemote,
			id: id
		})
	}

	private addEventListeners() {
		this.root.querySelector('button.create')
		.addEventListener('click', event => {
			const options = {
				title: this.titleInput.value,
				username: this.app.user.displayName || "Guest",
				userid: this.app.user.uid,
				color: this.colorSelector.getAttribute('red') !== null? 'red' : 'blue',
				opponent: this.opponentSelector.value
			}

			if(options.opponent === 'Online Player') {
				const lobby = {
					title: this.titleInput.value,
					time: new Date().getTime(),
					[options.color === 'blue'? 'p1' : 'p2']: {
						username: options.username,
						userid: options.userid
					}
				}
				this.createOnlineGame(lobby)
			} else if(options.opponent === 'Computer AI') {
				this.app.createGame({
					p1: options.color === 'blue'? Human : Computer,
					p2: options.color === 'red'? Human : Computer,
					id: "Human vs. Computer AI"
				})
			} else if(options.opponent === 'Local player') {
				this.app.createGame({
					p1: Human,
					p2: Human,
					id: "Local multiplayer"
				})
			}
		})
	}


	get titleInput()	   : HTMLInputElement  { return this.root.querySelector('input#title') }
	get usernameInput()    : HTMLInputElement  { return this.root.querySelector('input#username') }
	get colorSelector()    : HTMLElement	   { return this.root.querySelector('color') }
	get opponentSelector() : HTMLSelectElement { return this.root.querySelector('select.opponent') }
}