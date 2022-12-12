import Lobby from "./Lobby.js";
import App from "../App.js";

export default class LobbyManager {
	private root: HTMLDivElement
	public clickEvent: Function = null;
	
	constructor(selector: string, collection, private app: App) {
		this.root = document.querySelector(selector)
		
		const unsubscribe = collection.onSnapshot((snapshot) => {
			this.onSnapshot(snapshot);
		})
	}

	onSnapshot(snapshot) {
		const changes = snapshot.docChanges()
			.sort((a, b) => a.doc.data().time - b.doc.data().time)

		changes.forEach(change => {
			const { doc, type } = change
			const data    = doc.data()
			const lobby   = document.getElementById(doc.id)
			const full    = (data.p1 && data.p2)
			const empty   = (!data.p1 && !data.p2)
			// Time since added in minutes
			const time    = Math.abs(data.time - new Date().getTime())/60000
			const isValid = !(full || empty || time > 10)

			if (type === "removed" && lobby.parentElement) {
				lobby.parentElement.removeChild(lobby)
			}
			if(type === "added" && isValid) {
				this.root.appendChild( new Lobby(doc, this.app).dom )
			}
			if(type === "modified") {
				if(lobby) lobby.parentElement.removeChild(lobby)
				
				if(isValid) this.root.appendChild( new Lobby(doc, this.app).dom )					
			}
		});
	}
}