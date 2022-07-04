const getTemplate = (id, file, created) => {
  const template = document.createElement("template");
  template.innerHTML = `
  <style>
  :host { }
  ::slotted(*) { }
  .row {
    display: flex;
    border: 1px solid var(--gray);
    margin: 20px;
    gap: 10px;
    overflow: hidden;
    background-color: var(--white);
    border-radius: 6px;
    padding: 5px;
    box-shadow: 0 0 10px var(--black);
    color: var(--gray);
  }
  .row div {
    margin: 5px 0;
    padding: 0 10px;
    border-right: 1px solid var(--gray);
  }
  .row div:nth-child(3) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
  }
  .row div:last-child {
    border-right: none;
  }
  </style>
      <div class="row">
        <div>${id}</div>
        <div>${new Date(created).toLocaleDateString()}</div>
        <div>${file}</div>
        <div>
          <button type="button">d</button>
        </div>
      </div>
  `;

  return template.content.cloneNode(true);
};

class EdiRow extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return [""];
  }

  connectedCallback() {
    const { id, file, created } = this.attributes,
      template = getTemplate(id.value, file.value, created.value),
      button = template.querySelector("button");

    let deleteEvent = new CustomEvent("onDelete", {
      bubbles: true,
      detail: { id: id.value },
    });

    button.addEventListener("click", () => this.dispatchEvent(deleteEvent));

    this._shadowRoot.appendChild(template);
  }

  attributeChangedCallback(name, oldVal, newVal) {}
}
customElements.define("edi-row", EdiRow);
