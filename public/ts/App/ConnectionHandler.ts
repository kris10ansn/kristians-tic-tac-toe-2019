import App from "./App";

export default class ConnectionHandler {
	public connected: boolean = true;
	
	private disconnectEvents = new Array<() => void>();
	private reconnectEvents = new Array<() => void>();

	constructor(app: App) {
		firebase.database().ref(".info/connected")
			.on("value", snap => {
				const connected = snap.val();
				this.connected = connected;
				
				if(!connected && this.disconnectEvents.length > 0) {
					this.disconnectEvents.forEach(f => f());
				} else if(this.reconnectEvents.length > 0) {
					this.reconnectEvents.forEach(f => f());
				}
			});
	}
	
	public addDisconnectEvent(f: () => void) {
		this.disconnectEvents.push(f);
	}

	public addReconnectEvent(f: () => void) {
		this.reconnectEvents.push(f);
	}
}