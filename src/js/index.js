// импорт
var _ = require('lodash');// lodash.debounce
import cards from '../templates/card.hbs';// handlebars
import { error } from '../../node_modules/@pnotify/core/dist/PNotify.js';// pnotify
import * as basicLightbox from 'basiclightbox';//basicLightbox

// DOM-элементы
const refs = {
    formEl: document.getElementById('search-form'),
    listEl: document.getElementById('gallery')
}

// слушаем ввод
refs.formEl.addEventListener('input', _.debounce(onSearch, 800));

function onSearch(event) {
    event.preventDefault();

    const inputValue = event.target.value;

    if (inputValue === '') {
        refs.listEl.innerHTML = '';
        return;
    };

    sendRequest(inputValue)
};

function sendRequest(value) {
    // Настройки поиска
    const { image_type, orientation, page, per_page, key } = {
        image_type: 'photo',
        orientation: 'horizontal',
        page: '1',
        per_page: '12',
        key: '22892994-722ced5920981906a643cad7c'
    }

    fetch(`https://pixabay.com/api/?image_type=${image_type}&orientation=${orientation}&q=${value}&page=${page}&per_page=${per_page}&key=${key}`)
        .then(response => response.json())
        .then(photos => {
            // ошибка, если ничего не найдено
            if (photos.hits.length === 0) {
                error({ text: `${value} not found!` });
                refs.listEl.innerHTML = '';
                return;
            };

            // рендерим разметку карточек
            makeCards(photos.hits);

            // прослушиваем список карточек
            refs.listEl.addEventListener('click', findElement);

            // поиск выбраного элемента
            function findElement(event) {
                const id = event.srcElement.id;
                const photoById = getPhotoById(photos.hits, id);
                makeModalWindow(photoById);
            };
        })
        .catch(error => console.warn(error))
}

// создаем карточки с помощью handlebars
function makeCards(photosArray) {
    refs.listEl.innerHTML = cards(photosArray);
}

// поиск элемента по ID
function getPhotoById(array, id) {
    return array.find(x => x.id === +id);
}

// модалка с помощью basicLightbox
function makeModalWindow(object) {
    const instance = basicLightbox.create(`<img src='${object.largeImageURL}' width="800" height="600">`);
    instance.show();
};