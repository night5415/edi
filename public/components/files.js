const SEARCH_VALUE = "data-search",
  f = document.createElement("template");

f.innerHTML = `
<style>
.drop-zone {
  background-color: var(--gray);
  border: 3px dashed var(--black);
  color: var(--white);
  text-align: center;
  padding: 100px 0;
  margin: 0 20px;
}

.footer {
  position: sticky;
  bottom: 15px;
  width: 100%;
  text-align: center;
  pointer-events: none;
}

.footer input {
  font-size: 1.2rem;
  pointer-events: all;
  border: 3px solid var(--gray);
  border-radius: 6px;
  padding: 5px;
  text-align: center;
  opacity: 0.3;
  transition: all 0.25s;
}

.footer input:hover,
:active {
  opacity: 1;
}

ul {
  list-style-type: none;
  outline: none;
}

li {
  margin-top: 5px;
  cursor: pointer;
  border-radius: 6px;
  padding: 0 5px;
  transition: all 0.25s;
}

.highlight {
  padding: 0 5px;
  border-radius: 6px;
  background-color: var(--orange);
  color: var(--white);
  animation: highlightIn 600ms ease normal;
}

li:hover {
  background-color: var(--gray);
  color: var(--white);
}

#dialog{
  position: absolute;
  overflow: hidden;
  border: solid var(--gray) 2px;
  border-radius: 10px;
  padding: 0;
  user-select: text;
  width: 90vw;
  max-width: 1080px;
}

#context {
  position: absolute;
  overflow: hidden;
  border: none;
  border-radius: 2px;
  padding: 5px 15px;
  user-select: text;
  margin: 0;
  cursor: pointer;
}

dialog[open] {
  animation: fadeIn 1s ease normal;
}

dialog article {
  overflow: auto;
  height: 95vh;
  padding-right: 20px;
}

div[data-close] {
  background-color: var(--blue);
  color: var(--white);
  padding: 10px 15px;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 20px;
  box-shadow: 5px 5px 10px var(--gray);
  cursor: pointer;
  transition: all 0.25s;
}

div[data-close]:hover {
  transform: scale(1.2);
  background-color: var(--light-blue);
  box-shadow: 5px 3px 15px var(--gray);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes highlightIn {
  from {
    background-color: rgb(253, 225, 174);
  }
  to {
    background-color: var(--orange);
  }
}

.fade-out {
  animation: fadeOut 200ms normal forwards ease-in-out;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
    <div class="drop-zone" data-feature="drop" data-output="edi-list">
      Drop File / Or paste
    </div>
    <dialog id="dialog">
      <div data-close>X</div>
      <article>
        <ul id="edi-list" contenteditable></ul>
      </article>
      <div class="footer">
        <input type="text" placeholder="Search..." data-search />
      </div>
    </dialog>
    <dialog id="context">Paste</dialog>
`;

class Files extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this.timeout;
  }

  printOutput = (line, el) => {
    const li = document.createElement("li");
    li.setAttribute("data-value", line?.toUpperCase());
    li.innerText = line;
    el.appendChild(li);
  };

  get dialog() {
    return this._shadowRoot.getElementById(`dialog`);
  }

  get closeButton() {
    return this._shadowRoot.querySelector("[data-close]");
  }

  get searchBox() {
    return this._shadowRoot.querySelector("[data-search]");
  }

  get contextMenu() {
    return this._shadowRoot.getElementById("context");
  }

  static get observedAttributes() {
    return [""];
  }

  highlightText = (value) => {
    if (!Boolean(value)) {
      return;
    }

    const nValue = value.toUpperCase(),
      lis = [...this.dialog.querySelectorAll(`li[data-value*="${nValue}"]`)];

    lis.forEach((li) => {
      li.setAttribute(SEARCH_VALUE, true);
      li.innerHTML = li.innerHTML.replaceAll(
        nValue,
        `<span class="highlight">${nValue}</span>`
      );
    });
  };

  clearHighlightedText = () => {
    const old = [...this.dialog.querySelectorAll(`li[${SEARCH_VALUE}]`)];

    old.forEach((el) => {
      el.innerHTML = el.getAttribute("data-value");
      el.removeAttribute(SEARCH_VALUE);
    });
  };

  dialogSetup() {
    const clickOutside = (e) => {
        if (e.target !== this.dialog) {
          return;
        }

        this.dialog.close();
      },
      searchForText = () => {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.clearHighlightedText();
          this.highlightText(this.searchBox.value);
        }, 200);
      };

    this.dialog.addEventListener("click", clickOutside);
    this.closeButton.addEventListener("click", () => this.dialog.close());
    this.searchBox.addEventListener("keydown", searchForText);
  }

  openDialog = function (file) {
    const dialog = this.dialog,
      output = this._shadowRoot.getElementById("edi-list"),
      lines = file.split("~"),
      previous = Array.from(output.children);

    previous.forEach((children) => children.remove());

    lines.forEach((line) => this.printOutput(line, output));
    dialog.showModal();
  };

  connectedCallback() {
    const { _shadowRoot: dom } = this;
    dom.appendChild(f.content.cloneNode(true));

    const dropZones = dom.querySelectorAll(`[data-feature="drop"]`);

    this.dialogSetup();

    this.contextMenu.addEventListener("click", async () => {
      const userContent = await navigator.clipboard.readText();

      this.dispatchEvent(
        new CustomEvent("onUserPaste", {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: userContent,
        })
      );
      this.contextMenu.close();
    });

    dropZones.forEach((element) => {
      element.addEventListener("ondragover ", (event) => {
        event.stopPropagation();
        event.preventDefault();
      });

      element.addEventListener("drop", (event) => {
        event.preventDefault();
        const fileList = Array.from(event.dataTransfer.files);

        this.dispatchEvent(
          new CustomEvent("onUserDrop", {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: fileList,
          })
        );
      });

      element.addEventListener("contextmenu", (event) => {
        const { pageX, pageY } = event;
        event.preventDefault();
        this.contextMenu.showModal();
        this.contextMenu.style.top = `${pageY}px`;
        this.contextMenu.style.left = `${pageX}px`;
      });
    });
  }
}

customElements.define("m-file", Files);
