const pages = {
    file: {
      el: "m-file",
    },
    note: {
      el: "m-note",
    },
  },
  app = document.getElementById("app");

class Router {
  constructor() {
    window.addEventListener("hashchange", this.onHashChange);
  }

  onHashChange = function (e) {
    const { newURL = "" } = e,
      [, hash] = newURL.split("#"),
      component = pages[hash];

    if (!component) {
      return;
    }

    const el = document.createElement(component.el);
    app.replaceChildren(el);
  };
}

export default Router;
