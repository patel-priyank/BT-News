const logo = document.querySelector('.logo');
const searchBox = document.querySelector('.search-box');
const searchBoxInput = document.querySelector('.search-box input');
const searchBoxBtn = document.querySelector('.search-box i');
const headlinesBtn = document.querySelector('.headlines-btn');
const themeSwitch = document.querySelector('.theme-switch');
const scrollUpBtn = document.querySelector('.scroll-up-btn');
const title = document.querySelector('.title h2');
const btnCardView = document.querySelector('.btn-card-view');
const btnListView = document.querySelector('.btn-list-view');
const filters = document.querySelector('.filters');
const dateRangeSelector = document.querySelector('#date-range-selector');
const customRangeSelector = document.querySelector('.custom-range-selector');
const customFromDate = document.querySelector('#custom-from-date');
const customToDate = document.querySelector('#custom-to-date');
const sortBySelector = document.querySelector('#sort-by-selector');
const loader = document.querySelector('.loader-container');
const errorContainer = document.querySelector('.error-container');
const errorMessage = document.querySelector('.error-message div:first-child');
const refreshBtn = document.querySelector('.error-message .refresh');
const newsContent = document.querySelector('.news-content');

const apiKey = 'd8f40c9b90314b0f9d8bb4dfdeed5b7c';
const pageSize = 100;
const headlinesUrl = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&pageSize=${pageSize}&language=en`;
const searchUrl = `https://newsapi.org/v2/everything?apiKey=${apiKey}&pageSize=${pageSize}&language=en`;

const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';
const SUN_ICON = 'night';

const dateRangeValues = {
  anyTime: 'anyTime',
  pastDay: 'pastDay',
  pastMonth: 'pastMonth',
  pastYear: 'pastYear',
  customRange: 'customRange'
};

const sortByValues = {
  relevancy: 'relevancy',
  popularity: 'popularity',
  publishedAt: 'publishedAt'
};

const noImagePath = './no-image.jpg';
const articleDelimiter = ' [+';
const headlinesText = 'Headlines';
const searchText = 'Search Results';
const noHeadlinesText = 'No new top stories. Please try again later.';
const noResultsText = 'No results found. Try changing the search query or loosening the filters.';

let selectedDateRangeValue = dateRangeValues.anyTime;
let fromDateValue = '';
let toDateValue = '';
let selectedSortByValue = sortByValues.publishedAt;

// scroll to top
window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    scrollUpBtn.classList.add('show');
  } else {
    scrollUpBtn.classList.remove('show');
  }
});

// switch theme
function setTheme(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === LIGHT_THEME) {
    themeSwitch.classList.remove(SUN_ICON);
  } else {
    themeSwitch.classList.add(SUN_ICON);
  }
}

themeSwitch.addEventListener('click', () => {
  let theme = themeSwitch.classList.contains(SUN_ICON) ? LIGHT_THEME : DARK_THEME;
  setTheme(theme);
});

// get headlines
async function getHeadlines() {
  title.innerText = headlinesText; // change title
  filters.classList.remove('show'); // remove filters

  let response = await fetch(headlinesUrl);
  let data = await response.json();

  let fragment = document.createDocumentFragment();

  switch (data.status) {
    case 'ok':
      if (data.totalResults > 0) {
        data.articles.forEach((article) => {
          fragment.appendChild(getFormattedArticle(article));
        });

        hideLoader();
        newsContent.querySelector('ul').appendChild(fragment);
      } else {
        hideLoader();
        errorMessage.innerText = noHeadlinesText;
        showErrorMessage();
      }
      break;

    case 'error':
      hideLoader();
      errorMessage.innerText = data.message;
      showErrorMessage();
      break;
  }
}

// get search results
async function getSearchResults(keyword, sortByValue, dateRangeValue, fromDate, toDate) {
  title.innerText = searchText; // change title

  let url = `${searchUrl}&q=${keyword}&sortBy=${sortByValue}`;

  // modify url based on date range
  switch (dateRangeValue) {
    case dateRangeValues.anyTime:
      // no change to url
      break;

    case dateRangeValues.customRange:
      // add both from and to values
      if (fromDate) {
        url += `&from=${fromDate.toISOString().substring(0, fromDate.toISOString().lastIndexOf('.'))}`;
      }
      if (toDate) {
        url += `&to=${toDate.toISOString().substring(0, toDate.toISOString().lastIndexOf('.'))}`;
      }
      break;

    default:
      // add only from value
      url += `&from=${fromDate.toISOString().substring(0, fromDate.toISOString().lastIndexOf('.'))}`;
      break;
  }

  let response = await fetch(url);
  let data = await response.json();

  let fragment = document.createDocumentFragment();

  switch (data.status) {
    case 'ok':
      if (data.totalResults > 0) {
        data.articles.forEach((article) => {
          fragment.appendChild(getFormattedArticle(article));
        });

        hideLoader();
        filters.classList.add('show'); // show filters
        newsContent.querySelector('ul').appendChild(fragment);
      } else {
        hideLoader();
        errorMessage.innerText = noResultsText;
        showErrorMessage();
      }
      break;

    case 'error':
      hideLoader();
      errorMessage.innerText = data.message;
      showErrorMessage();
      break;
  }
}

// select card view
btnCardView.addEventListener('click', () => {
  btnCardView.classList.add('selected');
  btnListView.classList.remove('selected');
  newsContent.classList.add('card-view');
  newsContent.classList.remove('list-view');

  localStorage.setItem('view', 'card');
});

// select list view
btnListView.addEventListener('click', () => {
  btnListView.classList.add('selected');
  btnCardView.classList.remove('selected');
  newsContent.classList.add('list-view');
  newsContent.classList.remove('card-view');

  localStorage.setItem('view', 'list');
});

// show headlines on click of logo
logo.addEventListener('click', () => {
  clearSearchBox();
  clearNewsContent();
  showLoader();
  hideErrorMessage();
  getHeadlines();
});

// show headlines on click of headlines button
headlinesBtn.addEventListener('click', () => {
  clearSearchBox();
  clearNewsContent();
  showLoader();
  hideErrorMessage();
  getHeadlines();
});

// simulate pressing Enter in search box when clicking on search icon
searchBoxBtn.addEventListener('click', () => {
  searchBoxInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
});

// search for keyword when pressing Enter in search box
searchBoxInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    if (searchBoxInput.value === '') {
      // do not search if empty
      searchBox.classList.add('invalid');
    } else {
      resetDateRangeFilter();
      resetSortByFilter();
      clearNewsContent();
      showLoader();
      hideErrorMessage();
      getSearchResults(searchBoxInput.value, selectedSortByValue, selectedDateRangeValue, fromDateValue, toDateValue);
    }
  }
});

searchBox.addEventListener('animationend', () => {
  searchBox.classList.remove('invalid');
});

// update date range value when selecting from dropdown
dateRangeSelector.addEventListener('change', (event) => {
  selectedDateRangeValue = event.target.selectedOptions[0].value;

  switch (selectedDateRangeValue) {
    case dateRangeValues.anyTime:
      customRangeSelector.classList.remove('show');

      clearCustomRangeDates();
      fromDateValue = '';
      toDateValue = '';

      clearNewsContent();
      showLoader();
      hideErrorMessage();
      getSearchResults(searchBoxInput.value, selectedSortByValue, selectedDateRangeValue, fromDateValue, toDateValue);
      break;

    case dateRangeValues.customRange:
      customRangeSelector.classList.add('show');

      clearCustomRangeDates();
      fromDateValue = '';
      toDateValue = '';
      break;

    default:
      customRangeSelector.classList.remove('show');

      clearCustomRangeDates();
      toDateValue = '';

      let now = new Date();

      switch (selectedDateRangeValue) {
        case dateRangeValues.pastDay:
          fromDateValue = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          break;

        case dateRangeValues.pastMonth:
          fromDateValue = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;

        case dateRangeValues.pastYear:
          fromDateValue = new Date(now.getFullYear() - 1, 1, 1);
          break;
      }

      clearNewsContent();
      showLoader();
      hideErrorMessage();
      getSearchResults(searchBoxInput.value, selectedSortByValue, selectedDateRangeValue, fromDateValue, toDateValue);
      break;
  }
});

// update custom from date
customFromDate.addEventListener('change', (event) => {
  fromDateValue = event.target.value === '' ? '' : new Date(event.target.value);

  clearNewsContent();
  showLoader();
  hideErrorMessage();
  getSearchResults(searchBoxInput.value, selectedSortByValue, selectedDateRangeValue, fromDateValue, toDateValue);
});

// update custom to date
customToDate.addEventListener('change', (event) => {
  toDateValue = event.target.value === '' ? '' : new Date(event.target.value);

  clearNewsContent();
  showLoader();
  hideErrorMessage();
  getSearchResults(searchBoxInput.value, selectedSortByValue, selectedDateRangeValue, fromDateValue, toDateValue);
});

// update sort by value when selecting from dropdown
sortBySelector.addEventListener('change', (event) => {
  selectedSortByValue = event.target.selectedOptions[0].value;

  // search again after update
  clearNewsContent();
  showLoader();
  hideErrorMessage();
  getSearchResults(searchBoxInput.value, selectedSortByValue, selectedDateRangeValue, fromDateValue, toDateValue);
});

// reset date range value if coming from headlines page
function resetDateRangeFilter() {
  if (title.innerText === headlinesText) {
    dateRangeSelector.value = dateRangeValues.anyTime;
    selectedDateRangeValue = dateRangeValues.anyTime;
  }
}

// clear custom range dates
function clearCustomRangeDates() {
  customFromDate.value = '';
  customToDate.value = '';
}

// reset sort by value if coming from headlines page
function resetSortByFilter() {
  if (title.innerText === headlinesText) {
    sortBySelector.value = sortByValues.publishedAt;
    selectedSortByValue = sortByValues.publishedAt;
  }
}

function showLoader() {
  loader.classList.add('show');
}

function hideLoader() {
  loader.classList.remove('show');
}

function showErrorMessage() {
  errorContainer.classList.add('show');
}

function hideErrorMessage() {
  errorContainer.classList.remove('show');
}

// refresh page
refreshBtn.addEventListener('click', () => {
  location.reload();
});

// remove all news articles
function clearNewsContent() {
  newsContent.querySelector('ul').remove();

  let list = document.createElement('ul');
  newsContent.appendChild(list);
}

// clear search box
function clearSearchBox() {
  searchBoxInput.value = '';
}

// get formatted article to display in news content
function getFormattedArticle(article) {
  let listItem = document.createElement('li');

  let anchor = document.createElement('a');
  anchor.href = article.url;
  anchor.target = '_blank';

  let card = document.createElement('div');
  card.classList.add('card');

  let cardImage = document.createElement('div');
  cardImage.classList.add('card-image');

  let imagePlaceholder = document.createElement('img');
  imagePlaceholder.src = noImagePath;
  imagePlaceholder.alt = '';

  let image = document.createElement('img');
  image.src = article.urlToImage ? article.urlToImage : noImagePath;
  image.alt = '';

  let cardContent = document.createElement('div');
  cardContent.classList.add('card-content');

  let articleTitle = document.createElement('div');
  articleTitle.classList.add('article-title');
  articleTitle.innerText = article.title;

  let articleContent = document.createElement('div');
  articleContent.classList.add('article-content');
  articleContent.innerText = article.content
    ? article.content.substring(0, article.content.lastIndexOf(articleDelimiter))
    : '';

  cardImage.appendChild(imagePlaceholder);
  cardImage.appendChild(image);
  cardContent.appendChild(articleTitle);
  cardContent.appendChild(articleContent);
  card.appendChild(cardImage);
  card.appendChild(cardContent);
  anchor.appendChild(card);
  listItem.appendChild(anchor);

  return listItem;
}

// load last selected view on page load
if (localStorage.getItem('view') && localStorage.getItem('view') === 'list') {
  btnListView.click();
}

let today =
  `${new Date().getFullYear().toString()}-` +
  `${(new Date().getMonth() + 1).toString().padStart(2, 0)}-` +
  `${new Date().getDate().toString().padStart(2, 0)}`;

// set max date for custom from and to dates as today
customFromDate.setAttribute('max', today);
customToDate.setAttribute('max', today);

let currentTheme = localStorage.getItem('theme');

// set theme on page load
if (currentTheme === null) {
  currentTheme = LIGHT_THEME;
  localStorage.setItem('theme', currentTheme);
}

if (currentTheme === DARK_THEME) {
  themeSwitch.classList.add(SUN_ICON);
}

setTheme(currentTheme);

clearSearchBox(); // clear search box on page load
getHeadlines(); // get headlines on page load
