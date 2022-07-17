import { DataBase } from "./db.js";
const SEARCH_VALUE = "data-search",
  container = document.getElementById("previous-files");

let timeout, db;

export function init() {
  document.addEventListener("dragover", (event) => event.preventDefault());
  db = new DataBase("edition-1", 1);
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
  const list = await db.getAll("edi");

  container.append(
    ...list.map(({ id, file, created }) => {
      const row = document.createElement("edi-row");
      row.setAttribute("id", id);
      row.setAttribute("file", file);
      row.setAttribute("created", created);
      return row;
    })
  );

  container.addEventListener("onDelete", async (e) => {
    const { detail, target } = e,
      id = parseInt(detail.id),
      deleted = await db.delete(id, "edi");

    target.deleteRow(deleted);
  });

  container.addEventListener("onRowClick", async (e) => {
    const { detail } = e,
      id = parseInt(detail.id);

    const { file } = await db.getById(id, "edi");
    showDialog(file);
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
    li.innerHTML = li.innerHTML.replaceAll(
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
  reader.onload = async ({ target }) => {
    const file = target.result;

    const f = {
      id: Date.now(),
      file: file,
      created: new Date(),
    };

    await db.insert(f, "edi");

    const row = document.createElement("edi-row");

    row.setAttribute("id", f.id);
    row.setAttribute("file", f.file);
    row.setAttribute("created", f.created);
    container.append(row);

    showDialog(file);
  };
  reader.onerror = (e) => console.error(e);
  reader.readAsText(file);
};

const showDialog = (file) => {
  const output = document.getElementById("edi-list"),
    lines = file.split("~");
  //clear current file
  const previous = Array.from(output.children);
  previous.forEach((children) => children.remove());
  //print new file
  lines.forEach((line) => printOutput(line, output));
  //open modal
  const [dialog] = document.getElementsByTagName("dialog");
  dialog?.showModal();
};

const printOutput = (line, el) => {
  const li = document.createElement("li");
  li.setAttribute("data-value", line?.toUpperCase());
  li.innerText = line;
  el.appendChild(li);
};
