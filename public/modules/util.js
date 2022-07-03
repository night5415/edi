const SEARCH_VALUE = "data-search";
let timeout;

export function loaded() {
  document.addEventListener("dragover", (event) => event.preventDefault());
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
  reader.onload = (e) => {
    const output = document.getElementById("edi-list"),
      file = e.target.result,
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
  reader.onerror = (e) => console.error(e);
  reader.readAsText(file);
};

const printOutput = (line, el) => {
  const li = document.createElement("li");
  li.setAttribute("data-value", line?.toUpperCase());
  li.innerText = line;
  el.appendChild(li);
};
