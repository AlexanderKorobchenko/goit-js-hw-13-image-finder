// импорт
var _ = require('lodash');// lodash.debounce
import cards from '../templates/card.hbs';// handlebars
import { error, info } from '../../node_modules/@pnotify/core/dist/PNotify.js';// pnotify
import * as basicLightbox from 'basiclightbox';//basicLightbox
import PictureAPIServise from './apiService';
import Loader from './loader.js';

const newPictureAPIServise = new PictureAPIServise();
const changeLoader = new Loader('.loader');

// DOM-элементы
const refs = {
    formEl: document.getElementById('search-form'),
    listEl: document.getElementById('gallery'),
    endContetn: document.querySelector('.gallery__end')
}

// слушатели
refs.formEl.addEventListener('input', _.debounce(onInputSearch, 800));
window.addEventListener('scroll', onScpollSearch);

// вызов действия по реакции инпута
function onInputSearch(event) {
    event.preventDefault();

    refs.endContetn.classList.add('hidden');// прячем "End content" если он открыт
    newPictureAPIServise.resetAmount();//обнуляем сумму загруженных картинок

    // ввод пустой?
    if (event.target.value === '') {
        clearCards();// очищаем страницу
        newPictureAPIServise.resetPage();// номер страницы - 0
        return;
    };

    // все в порядке, работаем...
    changeLoader.addLoader();// загрузчик +
    clearCards();// очищаем страницу
    newPictureAPIServise.value = event.target.value;//передаем значение инпута
    newPictureAPIServise.resetPage();// номер страницы - 0
    newPictureAPIServise.getData().then(result => {
        processResults(result);// обработка результата fetch
        changeLoader.clearLoader();// закргузчик -
        if (result.hits.length !== 0) {
            info({
                text: `Total images found: ${newPictureAPIServise.total}`,
                delay: 2000,
            })
        };// сколько найдено
    });
};

// вызов действия по реакции скролла
function onScpollSearch() {
    // доскролил до конца?
    if (document.documentElement.scrollTop + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
        // картинки уже закончились?
        if (newPictureAPIServise.amount >= newPictureAPIServise.total) {
            refs.endContetn.classList.remove('hidden');// покажи "End content"
            return;
        };
        // все в порядке, работаем...
        changeLoader.addLoader();// закргузчик +
        newPictureAPIServise.getData().then(result => {
            processResults(result);// обработка результата fetch
            changeLoader.clearLoader();// закргузчик -
        });
    }
};

// обработка результата: проверка на ошибку, рендер, модалкa
function processResults(result) {
    // ошибка, если ничего не найдено
    if (result.hits.length === 0) {
        error({
            text: `No results were found for "${newPictureAPIServise.inputValue}".`,
            delay: 3000
        });
        clearCards();
        return;
    };

    // рендерим карточки
    makeCards(result.hits);
};

// создаем карточки (handlebars)
function makeCards(array) {
    refs.listEl.insertAdjacentHTML('beforeend', cards(array));
};

//удаляем карточки
function clearCards() {
    refs.listEl.innerHTML = '';
};

// слушаем карточки
refs.listEl.addEventListener('click', onFindElement);

// делаем модалку
function onFindElement(event) {
    const instance = basicLightbox.create(`<img src='${event.srcElement.attributes[5].value}'>`);
    instance.show();
};