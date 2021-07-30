const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createobjectstore("pending", { autoIncrement: true });
}

request.onsuccess = ({ target }) => {
    let db = target.result;
    if (navigator.onLine) {
        checkdatabase();
    }
}

request.onerror = (event) => console.log(event.target.errorCode);

function checkdatabase() {
    const transaction = db.transaction(["pending"], "readwrite")
    const store = transaction.objectStore("pending");
    const getall = store.getall()

    getall.onsuccess = () => {
     if  (getall.result.length > 0) {
         fetch("/api/transaction/bulk", {
             method: "POST",
             body: JSON.stringify (getall.result),
             headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
              }      
         })
         .then(res => {
             return response.json()
         } )
         .then(() => {
            const transaction = db.transaction(["pending"], "readwrite")
            const store = transaction.objectStore("pending");
            store.clear() 
         })
     } 
    }
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite")
    const store = transaction.objectStore("pending");
    store.add(record);
}

window.addEventListener("online", checkdatabase);
