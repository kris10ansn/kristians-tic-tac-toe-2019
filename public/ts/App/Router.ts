export default class Router {
	private static activated: Event = new CustomEvent("Router.activated", {})
	private static deactivated: Event = new CustomEvent("Router.deactivated", {})

	constructor() {
		this.initiateLinks();
	}

	public navigate(page: string, state = {}) {
		history.replaceState(state, page)
		const previous = document.querySelector('.active')
		const next = document.querySelector(`.${page}.page`);
		
		previous.classList.remove('active');
		next.classList.add('active');

		previous.dispatchEvent(Router.deactivated)
		next.dispatchEvent(Router.activated)
	}

	private initiateLinks() {
		[...document.getElementsByTagName('a')].forEach(a => {
			if(a.getAttribute('to') !== null) {
				a.addEventListener('click', e => {
				
					e.preventDefault();
					this.navigate(a.getAttribute('to'))
				})
			}
		})
	}
}