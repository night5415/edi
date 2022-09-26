const getTemplate = (id, file, created) => {
  const template = document.createElement("template");
  template.innerHTML = `
    <style>
        .row {
          display: flex;
          border: 1px solid var(--gray);
          margin: 20px 20px 0 20px;
          gap: 10px;
          overflow: hidden;
          background-color: var(--gray, #fff);
          color: var(--white, #000);
          border-radius: 6px;
          padding: 5px;
          box-shadow: 0 0 10px var(--black);
          transition: all 300ms;
        }
        .fade {
          height: 0;
          padding: 0;
          margin-top: 0;
          max-height: 0;
          border: none;
        }
        .row div {
          margin: 5px 0;
          padding: 0 10px;
          border-right: 1px solid var(--white, #000);
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
        .btn {
          cursor: pointer;
          border-radius: 6px;
          border: 1px solid var(--white);
          background-color: var(--background);
          color: var(--white, #000);
          transition: all 150ms;
          margin: 0 3px;
        }
        .btn:hover{
          box-shadow: 5px 5px 5px var(--black, #000);
          transform: scale(1.05);
        }
        .action {
          display: flex
        }
    </style>
    <div data-row="${id}" class="row">
      <div>${id}</div>
      <div>${new Date(created).toLocaleDateString()}</div>
      <div>${file}</div>
      <div class="action">
        <button type="button" class="btn edit">View</button>
        <button type="button" class="btn close">Remove</button>
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
    return ["name"];
  }

  deleteRow = function (id) {
    const row = this._shadowRoot.querySelector(`[data-row="${id}"]`);
    if (!row) {
      return;
    }

    row.classList.add("fade");
    setTimeout(() => this.remove(), 1000);
  };

  connectedCallback() {
    const { id, file, created } = this.attributes,
      template = getTemplate(id.value, file.value, created.value),
      close = template.querySelector(".close"),
      edit = template.querySelector(".edit");

    const deleteEvent = new CustomEvent("onDelete", {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: { id: id.value },
      }),
      editEvent = new CustomEvent("onView", {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: { id: id.value },
      });

    close.addEventListener("click", (e) => this.dispatchEvent(deleteEvent));
    edit.addEventListener("click", (e) => this.dispatchEvent(editEvent));

    this._shadowRoot.appendChild(template);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    console.dir({ name, oldVal, newVal });
  }
}

customElements.define("edi-row", EdiRow);
