'use strict';

const
    // Список названий месяцев
    MONTHS = [
        'Январь', 'Февраль', 'Март',
        'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь',
        'Октябрь', 'Ноябрь', 'Декабрь'
    ],
    // Список имён дней
    DAYS_NAMES = [
        'Пн', 'Вт', 'Ср',
        'Чт', 'Пт', 'Сб', 'Вс'
    ];

const
    // Получаем программу выбора периода времени
    datepicker = document.getElementById('datepicker'),

    // Получаем календари
    calendars = datepicker.querySelectorAll('.calendar'),

    // Получаем поле для вывода ошибки
    errorObject = datepicker.querySelector('.datepicker_error');


let calendarsItems = {}; // Массив для установки связей между input'ми и календарями

calendars.forEach((calendar, iter) => { // Проходимя по всем календарям
    calendar.dataset.id = iter          // Каждому присваеиваем data-id="${iter}"
    calendarsItems[iter] = {            // Заполняем массив
        date: new Date(),                      // Значение основной даты
        currentMonth: new Date().getMonth(),   // Значение месяца
        currentYear: new Date().getFullYear(), // Значение года
        calendar,                              // Пердаём сам календарь
        input: datepicker.querySelector(`[data-type="${calendar.dataset.type}"]`), // Связываем со своим input'ом
        inputWrapper: function () {                                                // Получаем обёртку input'а
            return this.input.closest('.datepicker_input__wrapper')
        },
        inputClear: function () {                                                   // Получаем кнопку очистки input'а
            return this.input.closest('.datepicker-group').querySelector('button.datepicker_delete')
        },
        yearObject: calendar.querySelector('.calendar-year'),      // Строка в календаре с годом
        monthObject: calendar.querySelector('.calendar-month'),    // Строка в календаре с месяцем
        weekObject: calendar.querySelector('.calendar-daysNames'), // Строка в календаре с днями недели
        daysObject: calendar.querySelector('.calendar-days')       // Таблица в календаре с днями
    }
})


const
    // Функция для заполнения строки с отображением и выбором года
    fillYearObject = calendar => {
        calendar.yearObject.querySelector('.calendar-year_number').innerHTML = calendar.currentYear; // Показываем год
        let
            currYear = calendar.currentYear,

            // Далее создание элементов с годами, и далее присвоение их списку
            anotherYears = '';
        for (let i = 0; i < 20; i++) {
            anotherYears += `<li data-year="${currYear}">${currYear--}</li>`;
        }
        calendar.yearObject.querySelector('.calendar-year-list').innerHTML = anotherYears;
    },

    // Функция для заполнения строки с отображением и выбором месяца(тот же алгоритм)
    fillMonthObject = calendar => {
        calendar.monthObject.querySelector('.calendar-month_name').innerHTML = MONTHS[calendar.currentMonth];

        let anotherMonths = '';
        MONTHS.forEach((month, iter) => {
            anotherMonths += `<li data-month="${iter}">${month}</li>`;
        });
        calendar.monthObject.querySelector('.calendar-month-list').innerHTML = anotherMonths;
    },

    // Функция для заполнения строки с отображением и выбором недели
    fillWeekObject = calendar => calendar.weekObject.innerHTML = DAYS_NAMES.map(elem => `<td>${elem}</td>`).join('');

let activeDays = []; // Список выделеных дней

// Функция перевода формата недели американского на европейский
const evropeWeekFormat = day => {
    // По американскому стилю, воскресенье - первый день недели
    day = day - 1; // Мы это исправили
    if (day < 0) day = 6;
    return day
}

// Функция перерисовки дней в календаре
const renderDays = calendar => {
    const
        // Положение первого дня месяца в первой неделе(0-6)
        positionDayInMonth = evropeWeekFormat(new Date(calendar.currentYear, calendar.currentMonth, 1).getDay()),

        // Количество дней в месяце(1-31)
        countDayInMonth = new Date(calendar.currentYear, calendar.currentMonth + 1, 0).getDate(),

        // Положение последнего дня в месяце в последней неделе(0-6)
        positionLastDayInMonth = evropeWeekFormat(new Date(calendar.currentYear, calendar.currentMonth, countDayInMonth).getDay()),

        // Количетство дней в предыдущем месяце
        countDayInPrevMonth = new Date(calendar.currentYear, calendar.currentMonth, 0).getDate();

    // Список, который будет содержать дни активного месяца
    let daysInList = [];

    // Заполняем массив числами предыдущего месяца
    for (let i = positionDayInMonth; i > 0; i--) {
        daysInList.push([countDayInPrevMonth - i + 1, 'prev']);
    }

    // Заполняем массив числами основного месяца
    for (let i = 1; i <= countDayInMonth; i++) {
        daysInList.push([i]);
    }

    // Заполняем массив числами следующего месяца
    for (let i = positionLastDayInMonth; i < 6; i++) {
        daysInList.push([i - positionLastDayInMonth + 1, 'next']);
    }

    // Начинаем работать с днями
    let daysObject = '';

    // Получаем количество недель
    const weeks = daysInList.length / Math.floor(daysInList.length / 5);
    for (let i = 0; i < weeks; i++) {
        // При каждой иттерации получаем следующие 7 дней
        const week = daysInList.splice(0, 7);
        let weekElem = '<tr class="">';
        let month = calendar.currentMonth + 1;
        week.forEach(day => {
            weekElem += `
                <td
                    data-day="${String(day[0]).length == 1 ? '0' + day[0] : day[0]}.${String(month).length == 1 ? '0' + month : month}.${calendar.currentYear}"
                    data-pos="${day[1] ? day[1] : 'inmonth'}"
                >${day[0]}</td>
            `;
        });
        weekElem += '</tr>';
        daysObject += weekElem;
    }
    // "Включаем" содержимое в таблицу
    calendar.daysObject.innerHTML = daysObject;
};

const

    // Функция переключения месяцев
    prevNextMonth = (instr, id) => {
        if (instr == 'prev') {
            calendarsItems[id].currentMonth--;
            if (calendarsItems[id].currentMonth < 0) {
                calendarsItems[id].currentMonth = 11;
                calendarsItems[id].currentYear--;
            }
        } else if (instr == 'next') {
            calendarsItems[id].currentMonth++;
            if (calendarsItems[id].currentMonth > 11) {
                calendarsItems[id].currentMonth = 0;
                calendarsItems[id].currentYear++;
            }
        } else {
            calendarsItems[id].currentMonth = instr;
        }

        calendarsItems[id].calendar.querySelector('.calendar-year_number').textContent = calendarsItems[id].currentYear;
        calendarsItems[id].calendar.querySelector('.calendar-month_name').textContent = MONTHS[calendarsItems[id].currentMonth];
        calendarsItems[id].date = new Date(calendarsItems[id].currentYear, calendarsItems[id].currentMonth);
        renderDays(calendarsItems[id])
    },

    // Функция переключения годов
    prevNextYear = (instr, id) => {
        if (instr == 'prev')
            calendarsItems[id].currentYear--;
        else if (instr == 'next')
            calendarsItems[id].currentYear++;
        else
            calendarsItems[id].currentYear = instr;
        calendarsItems[id].calendar.querySelector('.calendar-year_number').textContent = calendarsItems[id].currentYear;
        let date = new Date(calendarsItems[id].currentYear, calendarsItems[id].currentMonth);
        calendarsItems[id].date = date;
        renderDays(calendarsItems[id])
    },

    // Функция действий при клике на день в активном месяце
    dayClick = elem => {
        if (elem.dataset.pos == 'inmonth') {
            if (activeDays[elem.closest('.calendar').dataset.id]) {
                activeDays[elem.closest('.calendar').dataset.id].classList.remove('calendar_day--active')
            }

            calendarsItems[elem.closest('.calendar').dataset.id].inputWrapper().classList.add('datepicker_input__wrapper--active')
            calendarsItems[elem.closest('.calendar').dataset.id].inputClear().classList.add('datepicker_delete--show')
            calendarsItems[elem.closest('.calendar').dataset.id].input.value = elem.dataset.day
            elem.classList.add('calendar_day--active');
            activeDays[elem.closest('.calendar').dataset.id] = elem;
        }
    },

    // Функция очистки input'ов
    clearInputs = (elem = '') => {
        if (!elem) {
            Object.keys(calendarsItems).forEach(iter => {
                calendarsItems[iter].input.value = '';
            });
            Object.keys(calendarsItems).forEach(calendar => {
                calendarsItems[calendar].inputWrapper().classList.remove('datepicker_input__wrapper--active')
                calendarsItems[calendar].inputClear().classList.remove('datepicker_delete--show')
            });
        } else {
            let group = elem.closest('.datepicker-group');
            group.querySelector('.datepicker_input__wrapper').classList.toggle('datepicker_input__wrapper--active');
            elem.classList.toggle('datepicker_delete--show');
            group.querySelector('.datepicker_input').value = '';

        }
    },

    // Общая функция чистки
    clear = () => {
        clearInputs();
        errorObject.textContent = '';
        if (activeDays) {
            activeDays.forEach(elem => elem.classList.remove('calendar_day--active'))
        }
    },

    // Проверка на валидность периода
    check = () => {
        let values = [];
        Object.keys(calendarsItems).forEach(iter => {
            let value = calendarsItems[iter].input.value;
            value = value.split('.').reverse().join('-')
            values.push(value)
        });

        // С помощью объекта Date мы получаем разницу между второй и первой датой
        // Получаем её в милисекундах
        const difference = new Date(values[1]).getTime() - new Date(values[0]).getTime();
        if (difference < 0) {
            errorObject.textContent = 'Дата конца периода не может быть меньше даты начала периода';
        } else {
            errorObject.textContent = '';
        }
    },

    // Функция отображения списков годов и месяцев
    viewList = list => {
        list.classList.toggle('calendar-list--show')
    }

// Рендеринг приложения при полной загрузки сайта
// Можно обойтись и без него если при подключении скрипта добавить ему аттрибут "defer"
window.addEventListener('DOMContentLoaded', _e => {

    // При рендеринге ориентруемся именно на календари
    Object.keys(calendarsItems).forEach(iter => {
        renderDays(calendarsItems[iter]);
        fillYearObject(calendarsItems[iter]);
        fillMonthObject(calendarsItems[iter]);
        fillWeekObject(calendarsItems[iter]);
        clear(); // Очищаем всё, если то требуется(иногда input'ы сохраняют свои value)
    });
})


// Общий слушатель на всю страницу
// Это позволяет меньше нагружать браузер пользователя слушателями
// Так же, этот способ позволяет определять клик вне приложения и закрывать календари
window.addEventListener('click', _e => {

    // Ждём пока пользователь не нажмёт на кнопку "назад"
    if (_e.target.closest('.calendar_button--prev')) {

        // Уточняем что за элемент был нажат
        if (_e.target.closest('.calendar-year')) {

            // И в зависимости от условия выше вызываем нужную функцию
            // В данном случае переключение годов
            prevNextYear('prev', _e.target.closest('.calendar').dataset.id);
        }
        if (_e.target.closest('.calendar-month')) {

            // Вызываем функцию переключения месяцев
            prevNextMonth('prev', _e.target.closest('.calendar').dataset.id)
        }
    }

    // Ждём пока пользователь не нажмёт на кнопку "вперёд"
    if (_e.target.closest('.calendar_button--next')) {
        if (_e.target.closest('.calendar-year')) {
            prevNextYear('next', _e.target.closest('.calendar').dataset.id)
        }
        if (_e.target.closest('.calendar-month')) {
            prevNextMonth('next', _e.target.closest('.calendar').dataset.id)
        }
    }
    // Ждём пока пользователь не нажмёт на какой-нибудь день, именно день
    if (_e.target.closest('td') && _e.target.closest('.calendar-days')) {
        dayClick(_e.target.closest('td'));
    }

    // Ждём пока пользователь не нажмёт на кнопку "ПРИМЕНИТЬ"
    if (_e.target.closest('.datepicker-controls_apply')) {

        // Убираем календари
        document.querySelector('.datepicker-controls').classList.remove('datepicker-controls--show');

        // Проверяем корректность дат
        check();
    }

    // Ждём пока пользователь не нажмёт на input
    if (_e.target.closest('.datepicker_input')) {

        // Показываем календари
        document.querySelector('.datepicker-controls').classList.add('datepicker-controls--show');
    }

    // Ждём пока пользователь не нажмёт на кнопку очистки
    if (_e.target.closest('.datepicker_delete')) {
        clear()
    }

    // Ждём пока пользователь не нажмёт на что угодно кроме нашего приложения
    if (!_e.target.closest('#datepicker')) {

        // В этом случае проверяем отрыты ли календари, если да - закрываем
        if (document.querySelector('.datepicker-controls').classList.contains('datepicker-controls--show')) {
            document.querySelector('.datepicker-controls').classList.remove('datepicker-controls--show');

            // И чистим поля
            clear()
        }
    }

    // Ждём пока пользователь не нажмёт на год или месяц для показа списков
    if (_e.target.closest('.calendar-list__button')) {
        if (document.querySelector('.calendar-list--show'))
            document.querySelector('.calendar-list--show').classList.remove('calendar-list--show')
        viewList(_e.target.closest('.calendar-list__button').nextSibling);
    }

    // Ждём пока пользователь не нажмёт на год или месяц в списке
    if (_e.target.closest('[data-year]')) {

        // Получаем данные, переключаем календарь, закрываем списки
        prevNextYear(
            Number(_e.target.closest('[data-year]').dataset.year),
            _e.target.closest('[data-id]').dataset.id
        )
    }
    if (_e.target.closest('[data-month]')) {
        prevNextMonth(
            Number(_e.target.closest('[data-month]').dataset.month),
            _e.target.closest('[data-id]').dataset.id
        )
    }

    // Ждём пока пользователь не нажмёт на год или месяц
    if (_e.target.closest('.calendar-list')) {

        // Закрываем/Открываем списки
        _e.target.closest('.calendar-list').classList.toggle('calendar-list--show')
    }
});