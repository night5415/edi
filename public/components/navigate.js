const template = document.createElement("template");
template.innerHTML = `
<style>

</style>
<div>
    <button data-hash="note">Notes</button>
    <button data-hash="file">Files</button>
</div>
`;

class Navigation extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return [""];
  }

  connectedCallback() {
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    const links = this._shadowRoot.querySelectorAll("button");

    links.forEach((btn) =>
      btn.addEventListener("click", ({ target }) => {
        const hash = target.getAttribute("data-hash");
        window.location.hash = hash;
      })
    );
  }

  attributeChangedCallback(name, oldVal, newVal) {}
}
customElements.define("m-nav", Navigation);
