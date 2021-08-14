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
        info({
            text: `Total images found: ${newPictureAPIServise.total}`,
            delay: 2000,
        });// сколько найдено
    });
};

// вызов действия по реакции скролла
function onScpollSearch() {
    // доскролил до конца?
    if (document.documentElement.scrollTop + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
        // картинки уже закончились?
        if (newPictureAPIServise.amount >= newPictureAPIServise.total) {
            refs.endContetn.classList.remove('hidden');
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
            //mode: 'dark'
        });
        clearCards();
        return;
    };

    // рендерим карточки
    makeCards(result.hits);

    // слушаем карточки
    refs.listEl.addEventListener('click', onFindElement);

    // поиск выбраного элемента, вызов модалки basicLightbox
    function onFindElement(event) {
        const id = event.srcElement.id;
        const photoById = getPhotoById(result.hits, id);
        makeModalWindow(photoById);
    };
};

// создаем карточки (handlebars)
function makeCards(array) {
    refs.listEl.insertAdjacentHTML('beforeend', cards(array));
};

//удаляем карточки
function clearCards() {
    refs.listEl.innerHTML = '';
};

// поиск элемента по ID
function getPhotoById(array, id) {
    return array.find(element => element.id === +id);
};

// модалка basicLightbox
function makeModalWindow(object) {
    const instance = basicLightbox.create(`<img src='${object.largeImageURL}'>`);
    instance.show();
};