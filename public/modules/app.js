import { DataBase } from "./db.js";
const container = document.getElementById("previous-files"),
  app = document.getElementById("app");

let timeout, db;

export function init() {
  document.addEventListener("dragover", (event) => event.preventDefault());
  db = new DataBase("edition-1", 1);
  db.init();

  app.addEventListener("onUserPaste", ({ detail: pasted }) =>
    showDialog(pasted)
  );
  app.addEventListener("onUserDrop", ({ detail: files }) => {
    if (!Array.isArray(files)) {
      return;
    }
    files.forEach(fileReader);
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

  container.addEventListener("onView", async (e) => {
    const { detail } = e,
      id = parseInt(detail.id);

    const { file } = await db.getById(id, "edi");
    showDialog(file);
  });
}

const fileReader = (file) => {
  const reader = new FileReader();
  reader.onload = async ({ target }) => {
    const file = target.result;

    const newFile = {
      id: Math.floor(Math.random() * 1000000000),
      file: file,
      created: new Date(),
    };

    await db.insert(newFile, "edi");

    const row = document.createElement("edi-row");

    row.setAttribute("id", newFile.id);
    row.setAttribute("file", newFile.file);
    row.setAttribute("created", newFile.created);
    container.append(row);
  };
  reader.onerror = (e) => console.error(e);
  reader.readAsText(file);
};

const showDialog = (file) => {
  const dialog = document.querySelector(`m-file`);
  dialog.openDialog(file);
};
