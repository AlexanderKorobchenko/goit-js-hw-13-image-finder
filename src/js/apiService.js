export default class PictureAPIServise {
    constructor() {
        this.pageNumber = 1;
        this.inputValue = '';
        this.total = 0;
        this.amount = 0;
    }

    getData() {
        const { baseURL, image_type, orientation, per_page, key } = {
            baseURL: 'https://pixabay.com/api/',
            image_type: 'photo',
            orientation: 'horizontal',
            per_page: '12',
            key: '22892994-722ced5920981906a643cad7c'
        };

        const BASE_URL = `${baseURL}?image_type=${image_type}&orientation=${orientation}&q=${this.inputValue}&page=${this.pageNumber}&per_page=${per_page}&key=${key}`;

        return fetch(BASE_URL)
            .then(response => response.json())
            .then(result => {
                this.pageNumber += 1;
                this.total = result.totalHits;
                this.amount += result.hits.length;

                return result;
            })
            .catch(error => console.warn(error));
    }

    resetPage() {
        this.pageNumber = 1;
    }

    resetAmount() {
        this.amount = 0;
    }

    get value() {
        return this.inputValue;
    }

    set value(newInputValue) {
        this.inputValue = newInputValue;
    }
}