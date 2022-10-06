const bookShelf = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted,
    };
}

function findBook(bookId) {
    for (const book of bookShelf) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in bookShelf) {
        if (bookShelf[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookShelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            bookShelf.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function putInBook(bookObject) {
    const { id, title, author, year, isCompleted } = bookObject;

    const bookTitle = document.createElement("h3");
    bookTitle.innerText = title;

    const bookAuthor = document.createElement("p");
    bookAuthor.innerText = author;

    const bookYear = document.createElement("p");
    bookYear.innerText = year;

    const bookContainer = document.createElement("div");
    bookContainer.classList.add("inner");
    bookContainer.append(bookTitle, bookAuthor, bookYear);

    const container = document.createElement("div");
    container.classList.add("item", "shadow");
    container.append(bookContainer);
    container.setAttribute("id", `bookId-${id}`);

    if (isCompleted) {
        const unReadButton = document.createElement("button");
        unReadButton.classList.add("unRead-button");
        unReadButton.innerHTML = "Belum dibaca";
        unReadButton.addEventListener("click", function () {
            unReadBookFromCompleted(id);
        });

        const trashButton = document.createElement("button");
        trashButton.classList.add("trash-button");
        const deleteButton = document.getElementsByClassName("delete-button")[0];
        trashButton.innerHTML = "Hapus buku";
        trashButton.addEventListener("click", function () {
            toggleDialog();
            deleteButton.addEventListener("click", function () {
                removeBookFromCompleted(id);
                dialog.classList.remove("show-dialog");
            });
        });

        container.append(unReadButton, trashButton);
    } else {
        const checkButton = document.createElement("button");
        checkButton.classList.add("check-button");
        checkButton.innerHTML = "Sudah dibaca";
        checkButton.addEventListener("click", function () {
            addBookToCompleted(id);
        });
        const trashButton = document.createElement("button");
        trashButton.classList.add("trash-button");
        const deleteButton = document.getElementsByClassName("delete-button")[0];
        trashButton.innerHTML = "Hapus buku";
        trashButton.addEventListener("click", function () {
            toggleDialog();
            deleteButton.addEventListener("click", function () {
                removeBookFromCompleted(id);
                dialog.classList.remove("show-dialog");
            });
        });

        container.append(checkButton, trashButton);
    }

    return container;
}

const dialog = document.querySelector(".dialog");
const cancelButton = document.querySelector(".cancel-button");

function toggleDialog() {
    dialog.classList.toggle("show-dialog");
}

function windowOnClick(event) {
    if (event.target === dialog) {
        toggleDialog();
    }
}

cancelButton.addEventListener("click", toggleDialog);
window.addEventListener("click", windowOnClick);

function addBook() {
    const bookTitle = document.getElementById("inputBookTitle").value;
    const bookAuthor = document.getElementById("inputBookAuthor").value;
    const bookYear = document.getElementById("inputBookYear").value;
    let bookComplete = false;
    if (document.getElementById("inputBookIsComplete").checked) {
        bookComplete = true;
    }
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookComplete);
    bookShelf.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    bookShelf.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function unReadBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener("DOMContentLoaded", function () {
    const submitForm = document.getElementById("inputBook");

    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(SAVED_EVENT, () => {
    console.log("Data berhasil di simpan.");
});

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById("incompleteBookshelfList");
    const listCompleted = document.getElementById("completeBookshelfList");

    uncompletedBookList.innerHTML = "";
    listCompleted.innerHTML = "";

    for (const book of bookShelf) {
        const bookElement = putInBook(book);
        if (book.isCompleted) {
            listCompleted.append(bookElement);
        } else {
            uncompletedBookList.append(bookElement);
        }
    }
});

const search = document.getElementById("searchBookTitle");

search.addEventListener("input", function (event) {
    const searchBox = event.target.value.toLowerCase();
    const books = document.querySelectorAll(".book_shelf .inner h3");
    const shelf = Array.from(books);

    shelf.forEach((book) => {
        const eachTitle = book.innerText;
        const hide = book.parentElement;
        const parentElement = hide.parentElement;

        if (eachTitle.toLowerCase().indexOf(searchBox) == 0) {
            book.style.display = "block";
            parentElement.style.display = "block";
        } else {
            parentElement.style.display = "none";
        }
    });
});
