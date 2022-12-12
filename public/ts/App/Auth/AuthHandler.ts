export default class AuthHandler {

	private auth = firebase.auth();
	
	public user;
	public authChange: Function = null;
	public statusRef;

	public connected = true;

	public onDisconnect: () => void = null;
	public onReconnect: () => void = null;

	constructor(private db) {
		this.auth.onAuthStateChanged(user => { this.onAuthStateChanged(user) });

		this.initLinks();
	}
	
	private async authenticate(provider) {
		if(this.authenticated) return;
		
		if(provider !== null)
			await this.auth.signInWithPopup(provider);
		else
			await this.auth.signInAnonymously();
	}

	private onAuthStateChanged(user) {
		this.user = user;
		if(user != null) {
			const database = firebase.database();
			const ref = database.ref(`status/${user.uid}`);
			ref.set('online');
			ref.onDisconnect().set('offline');
		}
		if(this.authChange) this.authChange(user);
	}

	public signOut() {
		this.auth.signOut()
	}

	private initLinks() {
		[...document.getElementsByTagName('a')].forEach(a => {
			if(a.getAttribute('do') === "login") {
				a.addEventListener('click', e => {
					e.preventDefault();
					
					if(a.classList.contains('google-login'))
						this.authenticate(new firebase.auth.GoogleAuthProvider())
					else if(a.classList.contains('anonymous-login'))
						this.authenticate(null);
				})
			}
		})
	}

	get authenticated() { return (this.user !== null) }
}