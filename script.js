//list of features
// create card automatically after adding book (DONE)
// when page refreshes then use myLibrary array to run a loop and render everything (DONE)
// adding thumbnail image from google books api (DONE)
// adding thumbnail image link to localStorage so that API isn't called unnecessarily (DONE)
// creating a buffer icon while it is finding and displaying the thumbnail (DONE)
// all components are dynamically updated showcasing number of books logged, common reasons, etc (DONE)
// adding delete card option (done) + delete confirmation modal (done)
// attach event listener to delete button when card is added (done)
// adding filter functionality (done)
// adding progress bar below each card (stuck to card) to elevate UI (done)
// add colours to tags (done)
// prevent from adding duplicate (done)
// error handling (done)
// Mobile S and M responsive mode alignment fixes for .left pane
// adding light/dark mode (optional)

const showPopup = (status) => {
  const modalId = 'dynamic-popup';
  let existingModal = document.getElementById(modalId);

  if (status) {
    // 1. Remove existing to prevent duplicates
    if (existingModal) {
      existingModal.remove();
    }

    // 2. Define the Template (Now with custom CSS for the overlay)
    const content = `
            <div style="text-align: center; padding: 20px;">
                <div class="custom-spinner"></div>
                <h5 style="margin-top: 15px; font-family: sans-serif;">Adding Book...</h5>
            </div>
            `;

    const modalHtml = `
            <div id="${modalId}" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); display: flex; align-items: center;
                justify-content: center; z-index: 9999; font-family: sans-serif;">
                <div style="background: white; padding: 20px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); min-width: 200px;">
                    <div class="loader-content">${content}</div>
                </div>
            </div>`;

    // 3. Inject into the body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

  } else {
    // 4. Update to 'Success' state then hide
    if (existingModal) {
      const contentArea = existingModal.querySelector('.loader-content');
      contentArea.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #28a745;">
                    <div style="font-size: 40px; margin-bottom: 10px;">✓</div>
                    <h5>Done!</h5>
                </div>`;

      setTimeout(() => {
        existingModal.remove();
      }, 1000);
    }
  }
};

let myLibrary = JSON.parse(localStorage.getItem('myLibrary')) || [];
const title = document.getElementById('title');
const author = document.getElementById('author');
const totalPages = document.getElementById('total-pages');
const pagesRead = document.getElementById('pages-read');
const reason = document.getElementById('reasons-dropdown');
const filterDropdown = document.getElementById('filter-dropdown');
const deleteModal = document.getElementById('delete-container');
const errorModal = document.getElementById('error-container');
var findID = '';

init(myLibrary);

function init(library) {
  // console.log("library: ", library);
  for (let i = 0; i < library.length; i++) {
    createCard(library[i].title, library[i].author, library[i].totalPages, library[i].pagesRead, library[i].reason, library[i].imageURL, library[i].uid);
  }
  countLoggedBooks(myLibrary);
  // title.value = 'The Alchemist'
  // author.value = 'Paulo Coelho'
  // totalPages.value = '200';
  // pagesRead.value = '100';

  // title.value = 'The Stranger'
  // author.value = 'Albert Camus'
  // totalPages.value = '200';
  // pagesRead.value = '100';
  // reason.value = 'Writing style';

  // title.value = 'How to Win Friends and Influence People'
  // author.value = 'Dale Carnegie'
  // totalPages.value = '200';
  // pagesRead.value = '100';
  // reason.value = 'Boring plot';

  // title.value = 'The Hunger Games'
  // author.value = 'Suzanne Collins'
  // totalPages.value = '200';
  // pagesRead.value = '100';
  // reason.value = 'Too long';
}

async function addBook() {
  var duplicate = false;
  // check for empty fields
  if (!title.value || !author.value || !totalPages.value || !pagesRead.value) {
    errorModal.querySelector('.error-message').innerHTML = '<i class="fa-solid fa-circle-exclamation fa-xl"></i>&nbsp&nbspIncomplete book details.';
    errorModal.showModal();
    setTimeout(() => {
      errorModal.close();
    }, 2000);
    return;
  }
  // check for duplicate books
  for (let i = 0; i < myLibrary.length; i++) {
    if ((title.value == myLibrary[i].title && author.value == myLibrary[i].author)) {
      // errorModal.textContent = 'This book already exists in the library.';
      errorModal.querySelector('.error-message').innerHTML = '<i class="fa-solid fa-triangle-exclamation fa-xl"></i>&nbsp&nbspThis book already exists.';
      errorModal.showModal();
      setTimeout(() => {
        errorModal.close();
      }, 2000);
      duplicate = true;
      break;
    }
  }
  // add book if not duplicate
  if (!duplicate) {
    showPopup(true);
    const imageURL = await imageURLExtraction(title.value, author.value);
    var uid = crypto.randomUUID();
    // take params, create a book then store it in the array
    const book = new Book(title.value, author.value, totalPages.value, pagesRead.value, reason.value, imageURL, uid);
  }
}

function Book(title, author, totalPages, pagesRead, reason, imageURL, uid) {
  // the constructor
  this.title = title;
  this.author = author;
  this.totalPages = totalPages;
  this.pagesRead = pagesRead;
  this.reason = reason;
  this.imageURL = imageURL;
  this.uid = uid;
  myLibrary.push(
    {
      "title": title,
      "author": author,
      "pagesRead": pagesRead,
      "totalPages": totalPages,
      "reason": reason,
      "imageURL": imageURL,
      "uid": uid,
    }
  );
  localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
  // console.log("myLibrary: ", myLibrary);
  createCard(title, author, Number(totalPages), Number(pagesRead), reason, imageURL, uid);
  countLoggedBooks(myLibrary);
  clear();
}

function countLoggedBooks(library) {
  // creating array of reasons logged
  reasonArray = library.map(item => item.reason);
  // console.log("reasonArray: ", reasonArray);
  const groupByReason = { "Slow pacing": 0, "Writing style": 0, "Boring plot": 0, "Too long": 0 }; // initializing empty object
  const idReasonMap = { "slow-pacing": "Slow pacing", "writing-style": "Writing style", "boring-plot": "Boring plot", "too-long": "Too long" };
  if (reasonArray.length > 0) {
    // going through each reason
    for (const reason of reasonArray) {
      if (groupByReason[reason]) {
        groupByReason[reason]++; // incrementing count if reason already exists in groupByReason object
      }
      else {
        groupByReason[reason] = 1; // changing count to 1 if reason not found in groupByReason object
      }
    }
  }
  else {
    //
  }

  document.getElementById('total-books').textContent = library.length;

  for (const id in idReasonMap) {
    document.getElementById(`total-${id}`).textContent = groupByReason[idReasonMap[id]] + " (" + (Number.isNaN(groupByReason[idReasonMap[id]] / myLibrary.length) ? 0 : Math.round((groupByReason[idReasonMap[id]] / myLibrary.length) * 100)) + "%)";
    document.getElementById(`progress-${id}`).value = Number.isNaN(groupByReason[idReasonMap[id]] / myLibrary.length) ? 0 : Math.round((groupByReason[idReasonMap[id]] / myLibrary.length) * 100);
  };
}

async function imageURLExtraction(title, author) {
  // console.log("API used");
  var searchTitle = title.split(' ').join('+');
  var searchAuthor = author.split(' ').join('+');
  const query = `${searchTitle}+inauthor:${searchAuthor}`;
  const apiKey = "AIzaSyBJyN7-BqxNfO_a59SoheqdHPnp_Mo__88";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.items) {
      console.warn('No books found');
      return null;
    }
    const imageURL = data.items[2].volumeInfo.imageLinks.thumbnail;
    // console.log("imageURL: ", imageURL);
    return imageURL;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

filterDropdown.onchange = function () {
  // console.log("filter by: ", this.value);
  let unfilteredLibrary = [];
  let filteredLibrary = [];
  let originalLibrary = [];
  for (let i = 0; i < myLibrary.length; i++) {
    if (!(myLibrary[i].reason).includes(`${this.value}`) && this.value != "None") {
      unfilteredLibrary.push(myLibrary[i]);
    }
    else if ((myLibrary[i].reason).includes(`${this.value}`)) {
      filteredLibrary.push(myLibrary[i]);
    }
    else {
      // if filter selection = none then show all existing cards
      originalLibrary.push(myLibrary[i]);
    }
  }

  // console.log("unfilteredLibrary: ", unfilteredLibrary);
  // console.log("filteredLibrary: ", filteredLibrary);
  // console.log("originalLibrary: ", originalLibrary);
  // myLibrary = [];
  // console.log("library: ", myLibrary);
  // hide unfiltered cards
  for (let i = 0; i < unfilteredLibrary.length; i++) {
    document.getElementById(`card-${unfilteredLibrary[i].uid}`).style.display = 'none';
  }
  // show filtered cards
  for (let i = 0; i < filteredLibrary.length; i++) {
    document.getElementById(`card-${filteredLibrary[i].uid}`).style.display = 'flex';
  }

  for (let i = 0; i < originalLibrary.length; i++) {
    document.getElementById(`card-${originalLibrary[i].uid}`).style.display = 'flex';
  }
  if (this.value == "None") {
    countLoggedBooks(originalLibrary);
  }
  else {
    countLoggedBooks(filteredLibrary);
  }
}

function clear() {
  title.value = "";
  author.value = "";
  totalPages.value = "";
  pagesRead.value = "";
  reason.value = "Slow pacing";
}

function createCard(title, author, totalPages, pagesRead, reason, imageURL, uid) {
  const booksGrid = document.getElementById('books-grid');
  const card = document.createElement('div');
  card.id = `card-${uid}`;
  card.className = 'card';

  const cardTop = document.createElement('div');
  cardTop.className = 'card-top';

  const cardBottom = document.createElement('div');
  cardBottom.className = 'card-bottom';

  const img = document.createElement('img');
  img.id = `thumbnail-${title}`;
  if (imageURL) {
    img.src = imageURL;
  }
  else {
    img.src = "./bookcover.svg";
  }
  img.alt = 'Book Cover';
  img.style.width = '100px';
  img.style.aspectRatio = '3/4';
  // img.style.flex = '1 1 20%';

  const bookSummary = document.createElement('div');
  bookSummary.className = 'book-summary';
  bookSummary.style.flex = '1 1 20%';

  const bookDetails = document.createElement('div');
  bookDetails.className = 'book-details';

  const bookTitle = document.createElement('span');
  bookTitle.className = 'book-title';
  bookTitle.textContent = title;

  const bookAuthor = document.createElement('span');
  bookAuthor.className = 'author';
  bookAuthor.textContent = author;

  const percentReadText = document.createElement('span');
  percentReadText.className = 'percent-text';
  percentReadText.textContent = Math.round((pagesRead / totalPages) * 100) + "%" + " COMPLETED";

  bookDetails.appendChild(bookTitle);
  bookDetails.appendChild(bookAuthor);
  bookSummary.appendChild(bookDetails)
  bookSummary.appendChild(percentReadText);

  const dnfReason = document.createElement('span');
  dnfReason.className = 'dnf-reason';
  dnfReason.textContent = reason;
  dnfReason.style.flex = '0 0 auto';

  const removeBtn = document.createElement('button');
  removeBtn.id = `delete-${uid}`;
  removeBtn.className = 'remove';
  const deleteIcon = document.createElement('i');
  deleteIcon.className = 'fa solid fa-trash';
  removeBtn.appendChild(deleteIcon);

  const percentReadProgBar = document.createElement('progress');
  percentReadProgBar.className = 'percent-pg-bar';
  percentReadProgBar.value = Math.round((pagesRead / totalPages) * 100);
  percentReadProgBar.max = '100';

  switch (reason) {
    case "Slow pacing":
      dnfReason.style.color = '#B22222';
      dnfReason.style.backgroundColor = 'rgba(178, 34, 34, 0.111)';
      percentReadProgBar.style.accentColor = '#B22222';
      break;
    case "Writing style":
      dnfReason.style.color = '#0000ff';
      dnfReason.style.backgroundColor = 'rgba(0, 0, 255, 0.15)';
      percentReadProgBar.style.accentColor = '#0000ff';
      break;
    case "Boring plot":
      dnfReason.style.color = '#008080';
      dnfReason.style.backgroundColor = 'rgba(0, 128, 128, 0.111)';
      percentReadProgBar.style.accentColor = '#008080';
      break;
    case "Too long":
      dnfReason.style.color = '#800080';
      dnfReason.style.backgroundColor = 'rgba(128, 0, 128, 0.111)';
      percentReadProgBar.style.accentColor = '#800080';
      break;
  }

  cardTop.appendChild(img);
  cardTop.appendChild(bookSummary);
  cardTop.appendChild(dnfReason);
  cardTop.appendChild(removeBtn);
  cardBottom.appendChild(percentReadProgBar);
  card.appendChild(cardTop);
  card.appendChild(cardBottom);
  booksGrid.appendChild(card);

  showPopup(false);
}

document.getElementById('books-grid').addEventListener('click', function (event) {
  const deleteBtn = event.target.closest('.remove');
  if (deleteBtn) {
    findID = event.target.offsetParent.id;
    // console.log("findID: ", findID);
    deleteModal.showModal();
  }
});


deleteModal.addEventListener('close', function () {
  if (deleteModal.returnValue == 'confirm') {
    const findUID = findID.slice(7);
    // console.log("findUID:", findUID);
    const index = myLibrary.findIndex(obj => obj['uid'] === findUID);
    // console.log('index: ', index);
    // remove card and book info from myLibrary
    document.getElementById(`card-${findUID}`).remove();
    myLibrary.splice(index, 1);
    // console.log("library: ", myLibrary);
    localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
    // update all components
    countLoggedBooks(myLibrary);
  }
  else {
    return;
  }
});

// document.createElement('dialog');