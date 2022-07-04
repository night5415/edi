export class DataBase {
  db;
  get info() {
    return `database: ${this.dbName}; version: ${this.version}`;
  }

  get instance() {
    return this.db;
  }
  constructor(dbName, version) {
    this.dbName = dbName;
    this.version = version;
  }

  init = function () {
    const me = this,
      openRequest = indexedDB.open(this.dbName, this.version);

    openRequest.onupgradeneeded = function () {
      const x = openRequest.result;
      if (!x.objectStoreNames.contains("edi")) {
        x.createObjectStore("edi", { keyPath: "id" });
      }
    };

    openRequest.onerror = function () {
      console.error("Error", openRequest.error);
    };

    openRequest.onsuccess = function () {
      me.db = openRequest.result;
    };
  };

  insert = function (newRecord, store) {
    const transaction = this.db.transaction(store, "readwrite"),
      table = transaction.objectStore(store);

    return new Promise((res, rej) => {
      const request = table.add(newRecord);

      request.onsuccess = function () {
        res(request.result);
        console.log(`Record added to the store: ${store}`, request.result);
      };

      request.onerror = function () {
        rej(request.error);
        console.error("Error", request.error);
      };
    });
  };

  delete = function (id, store) {
    const transaction = this.db.transaction(store, "readwrite"),
      table = transaction.objectStore(store);

    return new Promise((res, rej) => {
      const request = table.delete(id);

      request.onsuccess = function () {
        res(id);
        console.log(`Record deleted from store: ${store}`, id);
      };

      request.onerror = function () {
        rej(request.error);
        console.error("Error", request.error);
      };
    });
  };

  getAll = function (store) {
    const transaction = this.db.transaction(store, "readonly"),
      table = transaction.objectStore(store);

    return new Promise((res, req) => {
      const request = table.getAll();
      request.onsuccess = function () {
        res(request.result);
        console.log(`All record returned from store: ${store}`, request.result);
      };

      request.onerror = function () {
        req(request.error);
        console.error("Error", request.error);
      };
    });
  };
}
