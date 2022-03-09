const URL = 'https://randomuser.me/api/?results=15';

function sendRequest(method) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.open(method, URL);

        xhr.responseType = 'json';

        xhr.onload = () => {
            if (xhr.status >= 400) {
                reject(xhr.response);
            } else {
                resolve(xhr.response);
            }
        }

        xhr.onerror = () => {
            reject(xhr.response)
        }

        xhr.send();
    });
}

// Declaration main variables and load main functions.
let table = getElById('users-table'); // Main table
let tableRow = table.rows;
// Ожидаем загрузки такого числа картинок, которое указано в ссылке после '='.
let loadImages = URL.split('=');
let imagesCount = Number(loadImages[1]);
// Function for get id elements
function getElById(item) {
    return document.getElementById(item);
}

sendRequest('GET', URL)
    .then(data => { return createTable(data); })
    .then(loader)
    .then(search)
    .catch(err => console.log(err))

// Loader
// Ждем загрузки всех картинок с сервера. В случае, если у пользователя супер быстрый интернет, лоадер все равно будет висеть 0.5 секунд.
function loader() {
    let images = document.images;
    let imagesLoadedCount = 0;

    // Создаем копию каждого изображения и после прогрузки каждой картинки вызываем функцию imageLoaded.
    for (let i = 0; i < imagesCount; i++) {
        imageCopy = new Image();
        imageCopy.onload = imageLoaded;
        imageCopy.src = images[i].src;
    }

    // В первую очередь увеличиваем число загруженных картинок, после чего проверяем совпадает ли это число с общим количеством картинок на странице.
    function imageLoaded() {
        imagesLoadedCount++;
        // В случае совпадения проверяем, есть ли класс done у preloader'a. Если нет - добавляем и таблица появляется.
        if (imagesLoadedCount >= imagesCount) {
            setTimeout(function() {
                let preloader = getElById('preloader');
                if (!preloader.classList.contains('done')) {
                    preloader.classList.add('done');
                };
            }, 500);
        }
    }
}

function createTable(data) {
    let usersData = data.results;
    let i = 1;
    let j = 0;
    let date;
    let largeImages = [];

    usersData.forEach(user => {
        date = new Date(Date.parse(user.registered.date));
        largeImage = user.picture.large;
        largeImages.push(usersData[j].picture.large);
        table.insertAdjacentHTML('beforeend',
            `<tbody index="${i}">
                <td>${i}</td>
                <td>${user.name.first}</td>
                <td>${user.name.last}</td>
                <td><img src="${user.picture.thumbnail}" onmouseover="tooltip('${largeImages[j]}')" onmouseout="tooltip(false)"></td>
                <td>${user.location.state}</td>
                <td>${user.location.city}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${date.toLocaleDateString()}</td>
            </tbody>`
        );
        i++;
        j++;
    });
}

// Search
// Регистрируем прослушивание события по нажатию на кнопку на клавиатуре, затем начинаем сравнивать фразу, 
// которую ввел пользователь с ячейками "First name", после чего просто скрываем строки, в которых отсутствуют совпадения.
function search() {
    let reset = getElById('reset-search');
    let phrase = getElById('search-item');
    reset.addEventListener('click', resetSearch);
    phrase.addEventListener('keyup', () => setTimeout(function() {
        let regPhrase = new RegExp(phrase.value, 'i');
        let j = 0; // j - счетчик скрытых картинок.
        for (let i = 1; i < tableRow.length; i++) {
            // Изначально flag = false, если введенная фраза совпадает с какой-либо/несколькими first name'ами,
            // тогда ничего не делаем.  
            let notFound = getElById('not-found');
            flag = false;
            flag = regPhrase.test(tableRow[i].cells[1].innerHTML);
            if (flag) {
                table.children[i].hidden = false;
                notFound.classList.remove('done');
                // Но когда flag не будет равен введенной фразе, мы скроем эти элементы.
            } else {
                table.children[i].hidden = true;
                j++; // И заодно j++
                // Если j равен изначальному количеству загруженных картинок, отрендерим окно безуспешного поиска.
                if (j === imagesCount) {
                    if (!notFound.classList.contains('done')) {
                        notFound.classList.add('done');
                    }
                }
            }
        }

    }, 250));
}

// Функция сброса поиска, в ней мы просто снова показываем все строки таблицы. 
function resetSearch() {
    let notFound = getElById('not-found');
    notFound.classList.remove('done');
    for (let i = 1; i < tableRow.length; i++) {
        table.children[i].hidden = false;
    }
}

// Tooltip
// В HTML заранее создан пустой тэг <img>, в src которого при наведении на картинку мы положим ссылку до изображения более высокого разрешения.
// Функция принимает переменную img, которую мы перебираем из массива всех картинок высокого разрешения, который заранее создали (при рендере таблицы).
function tooltip(img) {
    let tooltip = getElById('tooltip');
    if (img == false) {
        tooltip.classList.remove('done');
        tooltip.style.visibility = "hidden";
    } else {
        if (!tooltip.classList.contains('done')) {
            tooltip.classList.add('done');
        };
        tooltip.style.visibility = "visible";
        tooltip.setAttribute('src', img);
    }
}

// Sort Number
// Bubble sort для сортировки всех строк по порядку (от меньшего к большему).
function sortNumber() {
    for (let i = 1; i < table.children.length; i++) {
        for (let k = i; k < table.children.length; k++) {
            if (+table.children[i].getAttribute('index') > +table.children[k].getAttribute('index')) {
                replacedElement = table.replaceChild(table.children[k], table.children[i]);
                insertAfter(replacedElement, table.children[i]);
            }
        }
    }

    getElById('arrow').setAttribute('src', './img/down-arrow.png');
    getElById('number').setAttribute('onclick', 'reverseSortNumber()');
}

// Bubble sort для сортировки всех строк по порядку (от большего к меньшему).
function reverseSortNumber() {
    for (let i = 1; i < table.children.length; i++) {
        for (let k = i; k < table.children.length; k++) {
            if (+table.children[i].getAttribute('index') < +table.children[k].getAttribute('index')) {
                replacedElement = table.replaceChild(table.children[k], table.children[i]);
                insertAfter(replacedElement, table.children[i]);
            }
        }
    }

    getElById('arrow').setAttribute('src', './img/up-arrow.png');
    getElById('number').setAttribute('onclick', 'sortNumber()');
}

function insertAfter(oldElement, newElement) {
    return newElement.parentNode.insertBefore(oldElement, newElement.nextSibling);
}