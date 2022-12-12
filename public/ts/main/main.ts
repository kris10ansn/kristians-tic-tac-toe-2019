import Game from "../Game/Game/Game.js";
import Computer from "../Game/Players/Computer.js";
import Human from "../Game/Players/Human.js";
import Turn from "../Game/utils/Turn.js";
import FirebaseRemote from "../Game/Players/FirebaseRemote.js";
import Router from '../App/Router.js'
import App from "../App/App.js";

function start() {
	const app = new App();
}
// window.onload = start
window.addEventListener("load", start)