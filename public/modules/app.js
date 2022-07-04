import { DataBase } from "./db.js";
const SEARCH_VALUE = "data-search";
let db;

export function init() {
  document.addEventListener("dragover", (event) => event.preventDefault());
  db = new DataBase("test", 1);
  db.init();
}

export function attach() {
  const elements = document.querySelectorAll(`[data-feature="drop"]`);

  elements.forEach((element) => {
    element.addEventListener("ondragover ", (event) => {
      event.stopPropagation();
      event.preventDefault();
    });

    element.addEventListener("drop", (event) => {
      event.preventDefault();
      const fileList = Array.from(event.dataTransfer.files);
      fileList.forEach(fileReader);
    });
  });
}

export function dialogSetup() {
  const dialogs = Array.from(document.getElementsByTagName("dialog"));

  dialogs.forEach((dialog) => {
    const close = dialog.querySelector("[data-close]"),
      search = dialog.querySelector("[data-search]"),
      clickOutside = (e) => {
        if (e.target !== dialog) {
          return;
        }

        dialog.close();
      },
      searchForText = ({ target }) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          clearHighlightedText(dialog);
          highlightText(dialog, target.value);
        }, 200);
      };

    dialog?.addEventListener("click", clickOutside);
    close?.addEventListener("click", () => dialog.close());
    search?.addEventListener("keydown", searchForText);
  });
}

export async function getData() {
  const container = document.getElementById("test");

  const list = await db.getAll("edi");

  const rows = list.map((l) => {
    let row = document.createElement("edi-row");
    row.setAttribute("id", l.id);
    row.setAttribute("file", l.file);
    row.setAttribute("created", l.created);
    return row;
  });

  rows.forEach((row) => container.appendChild(row));

  container.addEventListener("onDelete", (e) => {
    const { detail } = e,
      id = parseInt(detail.id);

    db.delete(id, "edi");
  });
}

const highlightText = (dialog, value) => {
  if (!Boolean(value)) {
    return;
  }

  const nValue = value.toUpperCase(),
    lis = [...dialog.querySelectorAll(`li[data-value*="${nValue}"]`)];

  lis.forEach((li) => {
    li.setAttribute(SEARCH_VALUE, true);
    li.innerHTML = li.innerHTML.replace(
      nValue,
      `<span class="highlight">${nValue}</span>`
    );
  });
};

const clearHighlightedText = (dialog) => {
  const old = [...dialog.querySelectorAll(`li[${SEARCH_VALUE}]`)];

  old.forEach((el) => {
    el.innerHTML = el.getAttribute("data-value");
    el.removeAttribute(SEARCH_VALUE);
  });
};

const fileReader = (file) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const output = document.getElementById("edi-list"),
      file = e.target.result,
      lines = file.split("~");

    await db.insert(
      {
        id: Date.now(),
        file: file,
        created: new Date(),
      },
      "edi"
    );

    //clear current file
    const previous = Array.from(output.children);
    previous.forEach((children) => children.remove());
    //print new file
    lines.forEach((line) => printOutput(line, output));
    //open modal
    const [dialog] = document.getElementsByTagName("dialog");
    dialog?.showModal();
  };
  reader.onerror = (e) => console.error(e);
  reader.readAsText(file);
};

const printOutput = (line, el) => {
  const li = document.createElement("li");
  li.setAttribute("data-value", line?.toUpperCase());
  li.innerText = line;
  el.appendChild(li);
};
