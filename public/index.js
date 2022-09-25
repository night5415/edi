import { init, getData } from "./modules/app.js";
import Router from "./modules/router.js";

init();
setTimeout(getData, 250);

window.router = new Router();
