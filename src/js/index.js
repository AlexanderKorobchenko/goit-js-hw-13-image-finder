// импорт
var _ = require('lodash');// lodash.debounce
import cards from '../templates/card.hbs';// handlebars
import { error } from '../../node_modules/@pnotify/core/dist/PNotify.js';// pnotify
import * as basicLightbox from 'basiclightbox';//basicLightbox

// DOM-элементы
const refs = {
    formEl: document.getElementById('search-form'),
    listEl: document.getElementById('gallery'),
    loader: document.querySelector('.loader')
}

//options
let pageNumber = 1;
let inputValue = '';
const options = {
    baseURL: 'https://pixabay.com/api/',
    image_type: 'photo',
    orientation: 'horizontal',
    page: pageNumber,
    per_page: '12',
    key: '22892994-722ced5920981906a643cad7c'
}

// слушатели
refs.formEl.addEventListener('input', _.debounce(onSearch, 800));
window.addEventListener('scroll', () => {
    if (document.documentElement.scrollTop + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
        //console.log('scroll, page:', pageNumber)
        createLoader();
        getData2(options, inputValue, pageNumber);
    }
});

// передача значения инпута
function onSearch(event) {
    event.preventDefault();

    if (inputValue !== event.target.value) {
        inputValue = event.target.value;
        refs.listEl.innerHTML = '';
        pageNumber = 1;
    };

    if (inputValue === '') {
        refs.listEl.innerHTML = '';
        pageNumber = 1;
        return
    };

    createLoader()
    getData(options, inputValue);
};

function getData({ baseURL, image_type, orientation, page, per_page, key }, value) {
    fetch(`${baseURL}?image_type=${image_type}&orientation=${orientation}&q=${value}&page=${page}&per_page=${per_page}&key=${key}`)
        .then(response => response.json())
        .then(result => processResults(result))
        .catch(error => console.warn(error));
}

function getData2({ baseURL, image_type, orientation, per_page, key }, value, page) {
    fetch(`${baseURL}?image_type=${image_type}&orientation=${orientation}&q=${value}&page=${page}&per_page=${per_page}&key=${key}`)
        .then(response => response.json())
        .then(result => processResults(result))
        .catch(error => console.warn(error));
}

// обработка результата: проверка на ошибку, рендер, прослушка для модалки
function processResults(result) {
    // ошибка, если ничего не найдено
    if (result.hits.length === 0) {
        error({ text: `${inputValue} not found!` });
        refs.listEl.innerHTML = '';
        return;
    };

    // рендерим карточки
    makeCards(result.hits);
    pageNumber++;

    // слушаем карточки
    refs.listEl.addEventListener('click', onFindElement);

    // поиск выбраного элемента, вызов модалки basicLightbox
    function onFindElement(event) {
        const id = event.srcElement.id;
        const photoById = getPhotoById(result.hits, id);
        makeModalWindow(photoById);
    };
}

// создаем карточки, используя handlebars
function makeCards(array) {
    refs.listEl.insertAdjacentHTML('beforeend', cards(array));
}

// поиск элемента по ID
function getPhotoById(array, id) {
    return array.find(element => element.id === +id);
}

// модалка basicLightbox
function makeModalWindow(object) {
    const instance = basicLightbox.create(`<img src='${object.largeImageURL}' width="800" height="600">`);
    instance.show();
};

function createLoader() {
    refs.loader.classList.remove('hidden');
    setTimeout(() => {
        refs.loader.classList.add('hidden');
    }, 2000);
}