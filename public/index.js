import { attach, init, dialogSetup, getData } from "./modules/app.js";

init();
attach();
dialogSetup();
setTimeout(() => {
  getData();
}, 1000);
