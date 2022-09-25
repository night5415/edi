const t = document.createElement("template");
t.innerHTML = `
<style>
.test{
    background-color: "red",
    height: 100px,
    width: 100px
}
</style>
<div class="test">This is for notes</div>
`;

class Notes extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return [""];
  }

  connectedCallback() {
    this._shadowRoot.appendChild(t.content.cloneNode(true));
  }

  attributeChangedCallback(name, oldVal, newVal) {}
}
customElements.define("m-note", Notes);
