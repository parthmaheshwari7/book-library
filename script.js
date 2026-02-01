//list of features
// create card automatically after adding book (DONE)
// when page refreshes then use myLibrary array to run a loop and render everything (DONE)
// adding thumbnail image from google books api (creating a buffer icon while it is finding and displaying the thumbnail) - optional if too time consuming to get a good pixels image (DONE)
// all components are updated showcasing number of books logged, common reasons, etc
// adding delete card option
// adding search functionaility
// adding filter functionality
// adding light/dark mode (optional)

function ImgIDExtraction(title, author) {
  var searchTitle = title.split(' ').join('+');
  console.log("search title: ", searchTitle);
  var searchAuthor = author.split(' ').join('+');
  console.log("search author: ", searchAuthor);
  const query = `${searchTitle}+inauthor:${searchAuthor}`;
  console.log("query: ", query);
  // "harry+potter+inauthor:j.k.+rowling"; // or use encodeURIComponent("harry potter")
  const apiKey = "AIzaSyDvvVOXiuFi3zJROCHKQlvszhTLgxRkyII";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`;
  // const bookImgId = 
  // const url = `https://books.google.com/books/publisher/content/images/frontcover/qH6TEAAAQBAJ?fife=w400-h600&source=gbs_api`

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data.items) {
        console.log('No books found');
        return;
      }
      console.log("data: ", data.items)
      // data.items.forEach(book => {
        // const info = book.volumeInfo
        // console.log("info: ", info);
        const bookImgId = data.items[0].id;
        console.log("id: ", bookImgId);
        const imageURL = `https://cors-anywhere.herokuapp.com/https://books.google.com/books/publisher/content/images/frontcover/${bookImgId}?fife=w400-h600&source=gbs_api`;
        fetchAndDisplayImage(imageURL, `thumbnail-${title}`);
        //   imageLinks.thumbnail
        // console.log(`Title: ${info.title}`);
        // console.log(`Authors: ${info.authors ? info.authors.join(', ') : 'N/A'}`);
        // // console.log(`Description: ${info.description || 'N/A'}`);
        // console.log(`Thumbnail: ${info.imageLinks.thumbnail}`);
        // console.log('---');
      // });
    })
    .catch(error => console.error('Error fetching data:', error));
}

async function fetchAndDisplayImage(imageUrl, imgElementId) {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Convert the response to a Blob (binary data)
    const imageBlob = await response.blob();

    // Create a local URL for the blob data
    const localImageUrl = URL.createObjectURL(imageBlob);

    // Get the image element and set its src attribute
    const imgElement = document.getElementById(imgElementId);
    if (imgElement) {
      imgElement.src = localImageUrl;
    } else {
      console.error(`Image element with id "${imgElementId}" not found.`);
    }

  } catch (error) {
    console.error("Error fetching or displaying image:", error);
  }
}

// localStorage.removeItem('myLibrary');
let myLibrary = JSON.parse(localStorage.getItem('myLibrary')) || [];
init(myLibrary);
const title = document.getElementById('title');
const author = document.getElementById('author');
const totalPages = document.getElementById('total-pages');
const pagesRead = document.getElementById('pages-read');
const reason = document.getElementById('reasons-dropdown');

function init(library) {
  console.log("library: ", library);
  for (i = 0; i < library.length; i++) {
    createCard(library[i].title, library[i].author, library[i].totalPages, library[i].pagesRead, library[i].reason);
  }
}

function Book(title, author, totalPages, pagesRead, reason, uid) {
  // the constructor
  this.title = title;
  this.author = author;
  this.totalPages = totalPages;
  this.pagesRead = pagesRead;
  this.reason = reason;
  this.uid = uid;
  myLibrary.push(
    {
      "title": title,
      "author": author,
      "pagesRead": pagesRead,
      "totalPages": totalPages,
      "reason": reason,
      "uid": uid,
    }
  );
  localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
  console.log("myLibrary: ", myLibrary);
  createCard(title, author, Number(totalPages), Number(pagesRead), reason);
  // clear();
}

function addBook() {
  var uid = crypto.randomUUID();
  // take params, create a book then store it in the array
  const book = new Book(title.value, author.value, totalPages.value, pagesRead.value, reason.value, uid);
}

function clear() {
  title.value = "";
  author.value = "";
  totalPages.value = "";
  pagesRead.value = "";
  reason.value = "Slow Pacing";
}

function createCard(title, author, totalPages, pagesRead, reason) {
  // console.log(pagesRead, totalPages);
  // console.log(percentRead);
  const booksGrid = document.getElementById('books-grid');
  const card = document.createElement('div');
  card.className = 'card';

  const img = document.createElement('img');
  img.id = `thumbnail-${title}`;
  img.src = ImgIDExtraction(title, author);
  img.alt = 'Book Cover';

  // img.style.height = '100px';
  img.style.width = '100px';
  // img.style.height = '200';
  // img.style.width = 200;
  img.style.aspectRatio = '3/4';
  img.style.flex = '1 1 20%';
  // img.style.objectFit = 'cover';

  const bookSummary = document.createElement('div');
  bookSummary.className = 'book-summary';
  bookSummary.style.flex = '1 1 40%';

  const bookDetails = document.createElement('div');
  bookDetails.className = 'book-details';

  const bookTitle = document.createElement('span');
  bookTitle.className = 'book-title';
  bookTitle.textContent = title;

  const bookAuthor = document.createElement('span');
  bookAuthor.className = 'author';
  bookAuthor.textContent = author;

  const percentRead = document.createElement('span');
  percentRead.className = 'percent';
  percentRead.textContent = Math.round((pagesRead / totalPages) * 100) + "%" + " COMPLETED";

  bookDetails.appendChild(bookTitle);
  bookDetails.appendChild(bookAuthor);
  bookSummary.appendChild(bookDetails)
  bookSummary.appendChild(percentRead);

  const dnfReason = document.createElement('span');
  dnfReason.className = 'dnf-reason';
  dnfReason.textContent = reason;
  dnfReason.style.flex = '0 0 auto';

  card.appendChild(img);
  card.appendChild(bookSummary);
  card.appendChild(dnfReason);

  booksGrid.appendChild(card);
}