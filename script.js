//list of features
// create card automatically after adding book (DONE)
// when page refreshes then use myLibrary array to run a loop and render everything (DONE)
// adding thumbnail image from google books api (DONE)
// adding thumbnail image link to localStorage so that API isn't called unnecessarily (DONE)
// creating a buffer icon while it is finding and displaying the thumbnail (DONE)
// all components are dynamically updated showcasing number of books logged, common reasons, etc (DONE)
// adding delete card option (done) + delete confirmation modal (done)
// attach event listener to delete button when card is added (done)
// prevent from adding duplicate
// adding filter functionality
// adding progress bar below each card (stuck to card) to elevate UI
// error handling
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

// localStorage.removeItem('myLibrary');
let myLibrary = JSON.parse(localStorage.getItem('myLibrary')) || [];
// myLibrary.pop();
const title = document.getElementById('title');
const author = document.getElementById('author');
const totalPages = document.getElementById('total-pages');
const pagesRead = document.getElementById('pages-read');
const reason = document.getElementById('reasons-dropdown');
init(myLibrary);

function init(library) {
  console.log("library: ", library);
  for (i = 0; i < library.length; i++) {
    createCard(library[i].title, library[i].author, library[i].totalPages, library[i].pagesRead, library[i].reason, library[i].imageURL, library[i].uid);
  }
  countLoggedBooks();
  title.value = 'The Alchemist'
  author.value = 'Paulo Coelho'
  totalPages.value = '200';
  pagesRead.value = '100';

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
  showPopup(true);
  // take params, create a book then store it in the array
  if (!title.value || !author.value) {
    alert("not allowed");
  }
  else {
    const imageURL = await imageURLExtraction(title.value, author.value);
    // console.log("imageURL: ", imageURL);
    var uid = crypto.randomUUID();
    const book = new Book(title.value, author.value, totalPages.value, pagesRead.value, reason.value, imageURL, uid);
  }

}

function countLoggedBooks() {
  // creating array of reasons logged
  reasonArray = myLibrary.map(item => item.reason);
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

  document.getElementById('total-books').textContent = myLibrary.length;

  for(const id in idReasonMap){
    document.getElementById(`total-${id}`).textContent = groupByReason[idReasonMap[id]] + " (" + (Number.isNaN(groupByReason[idReasonMap[id]] / myLibrary.length) ? 0 : Math.round((groupByReason[idReasonMap[id]] / myLibrary.length) * 100)) + "%)";
  document.getElementById(`progress-${id}`).value = Number.isNaN(groupByReason[idReasonMap[id]] / myLibrary.length) ? 0 : Math.round((groupByReason[idReasonMap[id]] / myLibrary.length) * 100);
  };
}

async function imageURLExtraction(title, author) {
  // console.log("API used");
  var searchTitle = title.split(' ').join('+');
  var searchAuthor = author.split(' ').join('+');
  const query = `${searchTitle}+inauthor:${searchAuthor}`;
  // "harry+potter+inauthor:j.k.+rowling"; // or use encodeURIComponent("harry potter")
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
  console.log("myLibrary: ", myLibrary);
  createCard(title, author, Number(totalPages), Number(pagesRead), reason, imageURL, uid);
  countLoggedBooks();
  // clear();
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
  bookSummary.style.flex = '1 1 50%';

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
  percentReadProgBar.value = Math.round((pagesRead / totalPages) * 100);
  percentReadProgBar.max = '100';

  card.appendChild(img);
  card.appendChild(bookSummary);
  card.appendChild(dnfReason);
  card.appendChild(removeBtn);
  booksGrid.appendChild(card);
  // booksGrid.appendChild(percentReadProgBar);

  showPopup(false);
}

const deleteModal = document.getElementById('delete-container');
var findID = '';
document.getElementById('books-grid').addEventListener('click', function(event){
  const deleteBtn = event.target.closest('.remove');
  if (deleteBtn) {
    findID = event.target.offsetParent.id;
    // console.log("findID: ", findID);
    deleteModal.showModal();
  }
});
  

deleteModal.addEventListener('close', function () {
  if (deleteModal.returnValue == 'confirm') {
    // console.warn("Delete confirmed");
    const findUID = findID.slice(7);
    // console.log("findUID:", findUID);
    const index = myLibrary.findIndex(obj => obj['uid'] === findUID);
    // console.log('index: ', index);
    // remove card and book info from myLibrary
    document.getElementById(`card-${findUID}`).remove();
    myLibrary.splice(index, 1);
    console.log("library: ", myLibrary);
    // localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
    // update all components
    countLoggedBooks();
  }
  else {
    return;
  }
});

// document.createElement('dialog');