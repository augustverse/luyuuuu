/* =========================================================
   BLUERAIN STUDY
   Main Application
========================================================= */

const STORAGE_KEY = "blueRainStudy";

const subjects = [
    {
        id: "biology",
        name: "Biology",
        icon: "🧬",
        type: "Unit",
        total: 15
    },
    {
        id: "chemistry",
        name: "Chemistry",
        icon: "🧪",
        type: "Chapter",
        total: 10
    },
    {
        id: "physics",
        name: "Physics",
        icon: "⚡",
        type: "Chapter",
        total: 10
    },
    {
        id: "mathematics",
        name: "Mathematics",
        icon: "📐",
        type: "Chapter",
        total: 10
    },
    {
        id: "addmaths",
        name: "AddMaths",
        icon: "∑",
        type: "Chapter",
        total: 10
    },
    {
        id: "sejarah",
        name: "Sejarah",
        icon: "📜",
        type: "Bab",
        total: 10
    },
    {
        id: "bm",
        name: "Bahasa Melayu",
        icon: "🇲🇾",
        type: "Tema / Tatabahasa",
        total: 10
    },
    {
        id: "english",
        name: "English",
        icon: "🇬🇧",
        type: "Writing / Reading",
        total: 10
    },
    {
        id: "chinese",
        name: "华文",
        icon: "🖋️",
        type: "Unit / 作文 / 阅读",
        total: 10
    }
];


/* =========================================================
   DEFAULT DATA
========================================================= */

function createDefaultData() {

    const unitData = {};

    subjects.forEach(subject => {

        unitData[subject.id] = {};

        for (let i = 1; i <= subject.total; i++) {

            unitData[subject.id][i] = {
                status: "not-started",
                revision: false,
                notes: false,
                practice: false
            };

        }
    });


    return {
    studyGoal: 3,

    points: 0,

    records: [],

    focusSessions: [],

    todos: [],

    unitData,

    theme: "light",

    photo: "",

    lastSaved: Date.now()
};
}


let data = loadData();


function loadData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return createDefaultData();
    }

    try {

        const parsed = JSON.parse(saved);

        const defaultData = createDefaultData();

        return {
            ...defaultData,
            ...parsed
        };

    } catch {

        return createDefaultData();

    }
}


function saveData() {

    data.lastSaved = Date.now();

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =========================================================
   HELPERS
========================================================= */

function dateKey(date = new Date()) {

    const y = date.getFullYear();

    const m = String(date.getMonth() + 1)
        .padStart(2, "0");

    const d = String(date.getDate())
        .padStart(2, "0");

    return `${y}-${m}-${d}`;

}


function formatDuration(minutes) {

    minutes = Math.max(
        0,
        Math.round(minutes)
    );

    const h = Math.floor(minutes / 60);

    const m = minutes % 60;

    return `${h}h ${String(m).padStart(2, "0")}m`;

}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);

}


/* =========================================================
   NAVIGATION
========================================================= */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    const page =
        document.getElementById(pageId);

    if (page) {

        page.classList.add("active");

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === pageId
            );

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(button.dataset.page);

                document
                    .querySelector(".sidebar")
                    .classList.remove("open");

            }
        );

    });


document
    .querySelectorAll("[data-page]")
    .forEach(button => {

        if (!button.classList.contains("nav-item")) {

            button.addEventListener(
                "click",
                () => showPage(button.dataset.page)
            );

        }

    });


/* mobile */

document
    .getElementById("mobileMenu")
    .addEventListener("click", () => {

        document
            .querySelector(".sidebar")
            .classList.toggle("open");

    });


/* =========================================================
   DATE
========================================================= */

function renderDate() {

    const now = new Date();

    document
        .getElementById("todayDate")
        .textContent =
        now.toLocaleDateString(
            "en-MY",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


renderDate();


/* =========================================================
   STUDY RECORDS
========================================================= */

function addStudyRecord({
    subjectId,
    unit,
    minutes,
    focus = false
}) {

    if (minutes <= 0) return;


    const record = {

        id: Date.now(),

        date: dateKey(),

        subjectId,

        unit,

        minutes,

        focus,

        timestamp: Date.now()

    };


    data.records.push(record);


    if (focus) {

        data.focusSessions.push({
            date: dateKey(),
            subjectId,
            unit,
            minutes,
            timestamp: Date.now()
        });

    }


    data.points +=
        Math.floor(minutes / 30) * 10;


    saveData();

    renderAll();

    showToast(
        `✨ +${minutes} min study · +${Math.floor(minutes / 30) * 10} points`
    );

}


/* =========================================================
   STATISTICS
========================================================= */

function getTodayRecords() {

    const today = dateKey();

    return data.records.filter(
        record => record.date === today
    );

}


function getTodayMinutes() {

    return getTodayRecords()
        .reduce(
            (sum, r) => sum + r.minutes,
            0
        );

}


function getWeekMinutes() {

    const now = new Date();

    const day = now.getDay();

    const diff =
        day === 0 ? 6 : day - 1;

    const monday = new Date(now);

    monday.setHours(0, 0, 0, 0);

    monday.setDate(
        now.getDate() - diff
    );


    return data.records
        .filter(record => {

            const d =
                new Date(record.timestamp);

            return d >= monday;

        })
        .reduce(
            (sum, r) => sum + r.minutes,
            0
        );

}


function getMonthMinutes() {

    const now = new Date();

    const year = now.getFullYear();

    const month = now.getMonth();


    return data.records
        .filter(record => {

            const d =
                new Date(record.timestamp);

            return (
                d.getFullYear() === year &&
                d.getMonth() === month
            );

        })
        .reduce(
            (sum, r) => sum + r.minutes,
            0
        );

}


/* =========================================================
   STREAK
========================================================= */

function getStudyStreak() {

    const days = new Set(
        data.records.map(
            record => record.date
        )
    );


    let current =
        new Date();

    let streak = 0;


    while (true) {

        const key =
            dateKey(current);

        if (!days.has(key)) {

            break;

        }

        streak++;

        current.setDate(
            current.getDate() - 1
        );

    }


    return streak;

}

/* =========================================================
   CALENDAR
========================================================= */

let calendarDate = new Date();
let selectedCalendarDate = dateKey();


function getRecordsByDate(key) {

    return data.records.filter(
        record => record.date === key
    );

}


function getDateTotalMinutes(key) {

    return getRecordsByDate(key)
        .reduce(
            (sum, record) => sum + Number(record.minutes || 0),
            0
        );

}


function getDateFocusMinutes(key) {

    return getRecordsByDate(key)
        .filter(record => record.focus)
        .reduce(
            (sum, record) => sum + Number(record.minutes || 0),
            0
        );

}


function getDateFocusSessions(key) {

    return getRecordsByDate(key)
        .filter(record => record.focus)
        .length;

}


function getHeatLevel(minutes) {

    if (minutes >= 120) return 4;
    if (minutes >= 90) return 3;
    if (minutes >= 45) return 2;
    if (minutes > 0) return 1;

    return 0;

}


function renderCalendar() {

    const grid =
        document.getElementById("calendarGrid");

    const title =
        document.getElementById("calendarMonthTitle");

    if (!grid || !title) return;


    grid.innerHTML = "";


    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    title.textContent =
        calendarDate.toLocaleDateString(
            "en-MY",
            {
                month: "long",
                year: "numeric"
            }
        );


    /*
        JS:
        0 = Sunday
        转成：
        0 = Monday
    */

    const firstDay =
        new Date(year, month, 1);

    let startDay =
        (firstDay.getDay() + 6) % 7;


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const previousMonthDays =
        new Date(
            year,
            month,
            0
        ).getDate();


    /*
        生成 42 格
        让 Calendar 保持整齐
    */

    for (let i = 0; i < 42; i++) {

        let dayNumber;
        let cellDate;
        let otherMonth = false;


        if (i < startDay) {

            dayNumber =
                previousMonthDays -
                startDay +
                i +
                1;

            cellDate =
                new Date(
                    year,
                    month - 1,
                    dayNumber
                );

            otherMonth = true;

        } else if (
            i >= startDay + daysInMonth
        ) {

            dayNumber =
                i -
                startDay -
                daysInMonth +
                1;

            cellDate =
                new Date(
                    year,
                    month + 1,
                    dayNumber
                );

            otherMonth = true;

        } else {

            dayNumber =
                i -
                startDay +
                1;

            cellDate =
                new Date(
                    year,
                    month,
                    dayNumber
                );

        }


        const key =
            dateKey(cellDate);


        const minutes =
            getDateTotalMinutes(key);


        const focusMinutes =
            getDateFocusMinutes(key);


        const focusSessions =
            getDateFocusSessions(key);


        const level =
            getHeatLevel(minutes);


        const cell =
            document.createElement("button");


        cell.type = "button";

        cell.className =
            `calendar-day level-${level}`;


        if (otherMonth) {

            cell.classList.add(
                "other-month"
            );

        }


        if (key === dateKey()) {

            cell.classList.add(
                "today"
            );

        }


        if (key === selectedCalendarDate) {

            cell.classList.add(
                "selected"
            );

        }


        cell.innerHTML = `
            <span class="calendar-day-number">
                ${dayNumber}
            </span>

            ${
                minutes > 0
                    ? `
                        <span class="calendar-day-minutes">
                            ${minutes}m
                        </span>
                    `
                    : ""
            }

            ${
                focusSessions > 0
                    ? `
                        <span class="calendar-day-dot">
                            ${focusSessions}
                        </span>
                    `
                    : ""
            }
        `;


        cell.addEventListener(
            "click",
            () => {

                selectedCalendarDate =
                    key;

                renderCalendar();

                renderCalendarDetail();

            }
        );


        grid.appendChild(cell);

    }


    renderCalendarDetail();

}


function renderCalendarDetail() {

    const title =
        document.getElementById(
            "selectedDateTitle"
        );

    const total =
        document.getElementById(
            "selectedDayTotal"
        );

    const focus =
        document.getElementById(
            "selectedDayFocus"
        );

    const breakdown =
        document.getElementById(
            "subjectBreakdown"
        );


    if (
        !title ||
        !total ||
        !focus ||
        !breakdown
    ) return;


    const records =
        getRecordsByDate(
            selectedCalendarDate
        );


    const date =
        new Date(
            selectedCalendarDate +
            "T00:00:00"
        );


    title.textContent =
        date.toLocaleDateString(
            "en-MY",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    const totalMinutes =
        records.reduce(
            (sum, record) =>
                sum + Number(record.minutes || 0),
            0
        );


    const focusMinutes =
        records
            .filter(record => record.focus)
            .reduce(
                (sum, record) =>
                    sum + Number(record.minutes || 0),
                0
            );


    total.textContent =
        formatDuration(totalMinutes);


    focus.textContent =
        formatDuration(focusMinutes);


    if (!records.length) {

        breakdown.innerHTML = `
            <div class="todo-empty">
                📖 No study records for this day.
            </div>
        `;

        return;

    }


    const subjectData = {};


    records.forEach(record => {

        if (!subjectData[record.subjectId]) {

            subjectData[record.subjectId] = {
                minutes: 0,
                focus: 0
            };

        }


        subjectData[
            record.subjectId
        ].minutes +=
            Number(record.minutes || 0);


        if (record.focus) {

            subjectData[
                record.subjectId
            ].focus +=
                Number(record.minutes || 0);

        }

    });


    const sorted =
        Object.entries(subjectData)
            .sort(
                (a, b) =>
                    b[1].minutes -
                    a[1].minutes
            );


    breakdown.innerHTML = `
        <div class="subject-breakdown-title">
            Subject Breakdown
        </div>

        ${sorted.map(
            ([subjectId, info]) => {

                const subject =
                    subjects.find(
                        s =>
                            s.id === subjectId
                    );


                const percentage =
                    totalMinutes > 0
                        ? Math.round(
                            info.minutes /
                            totalMinutes *
                            100
                        )
                        : 0;


                return `
                    <div class="subject-stat-row">

                        <div class="subject-stat-header">

                            <strong>
                                ${subject?.icon || "📚"}
                                ${subject?.name || subjectId}
                            </strong>

                            <span>
                                ${info.minutes} min · ${percentage}%
                            </span>

                        </div>

                        <div class="subject-stat-bar">

                            <div
                                style="width:${percentage}%"
                            ></div>

                        </div>

                        ${
                            info.focus > 0
                                ? `
                                    <small>
                                        Focus: ${info.focus} min
                                    </small>
                                `
                                : ""
                        }

                    </div>
                `;

            }
        ).join("")}
    `;

}


/* Calendar navigation */

const prevMonth =
    document.getElementById(
        "prevMonth"
    );

const nextMonth =
    document.getElementById(
        "nextMonth"
    );


if (prevMonth) {

    prevMonth.addEventListener(
        "click",
        () => {

            calendarDate.setMonth(
                calendarDate.getMonth() - 1
            );

            renderCalendar();

        }
    );

}


if (nextMonth) {

    nextMonth.addEventListener(
        "click",
        () => {

            calendarDate.setMonth(
                calendarDate.getMonth() + 1
            );

            renderCalendar();

        }
    );

}


/* =========================================================
   STATISTICS
========================================================= */


function getTotalStudyMinutes() {

    return data.records.reduce(
        (sum, record) =>
            sum + Number(record.minutes || 0),
        0
    );

}


function getTotalFocusMinutes() {

    return data.focusSessions.reduce(
        (sum, session) =>
            sum + Number(session.minutes || 0),
        0
    );

}


function getTotalDrop() {

    /*
        每 30 分钟 = 10 points
        所以这里把 points 换算成学习获得的
        "雨滴"
    */

    return Math.floor(
        data.points / 10
    );

}


function getLongestStreak() {

    const days =
        [...new Set(
            data.records.map(
                record => record.date
            )
        )].sort();


    if (!days.length) return 0;


    let longest = 1;
    let current = 1;


    for (let i = 1; i < days.length; i++) {

        const previous =
            new Date(
                days[i - 1] +
                "T00:00:00"
            );


        const currentDate =
            new Date(
                days[i] +
                "T00:00:00"
            );


        const difference =
            Math.round(
                (
                    currentDate -
                    previous
                ) /
                86400000
            );


        if (difference === 1) {

            current++;

            longest =
                Math.max(
                    longest,
                    current
                );

        } else {

            current = 1;

        }

    }


    return longest;

}


function getWeekStart(date = new Date()) {

    const result =
        new Date(date);

    result.setHours(
        0,
        0,
        0,
        0
    );


    const day =
        result.getDay();


    const mondayOffset =
        day === 0
            ? 6
            : day - 1;


    result.setDate(
        result.getDate() -
        mondayOffset
    );


    return result;

}


function getWeeklyMinutes() {

    const monday =
        getWeekStart();


    const values = [];


    for (let i = 0; i < 7; i++) {

        const day =
            new Date(monday);


        day.setDate(
            monday.getDate() + i
        );


        const key =
            dateKey(day);


        values.push(
            getDateTotalMinutes(key)
        );

    }


    return values;

}


function renderStatistics() {

    const totalStudy =
        document.getElementById(
            "statTotalStudy"
        );

    const totalFocus =
        document.getElementById(
            "statTotalFocus"
        );

    const totalDrop =
        document.getElementById(
            "statTotalDrop"
        );

    const longestStreak =
        document.getElementById(
            "statLongestStreak"
        );


    if (totalStudy) {

        totalStudy.textContent =
            formatDuration(
                getTotalStudyMinutes()
            );

    }


    if (totalFocus) {

        totalFocus.textContent =
            formatDuration(
                getTotalFocusMinutes()
            );

    }


    if (totalDrop) {

        totalDrop.textContent =
            getTotalDrop();

    }


    if (longestStreak) {

        longestStreak.textContent =
            `${getLongestStreak()} days`;

    }


    renderWeeklyChart();

    renderStatisticsSubjects();

}


function renderWeeklyChart() {

    const chart =
        document.getElementById(
            "weeklyChart"
        );


    const label =
        document.getElementById(
            "weeklyTotalLabel"
        );


    if (!chart) return;


    const values =
        getWeeklyMinutes();


    const names =
        [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
        ];


    const max =
        Math.max(
            ...values,
            60
        );


    chart.innerHTML =
        values.map(
            (minutes, index) => {

                const height =
                    minutes > 0
                        ? Math.max(
                            8,
                            minutes /
                            max *
                            100
                        )
                        : 4;


                return `
                    <div class="weekly-bar-wrapper">

                        <span class="weekly-value">
                            ${minutes}m
                        </span>

                        <div
                            class="weekly-bar"
                            style="height:${height}%"
                            title="${minutes} minutes"
                        ></div>

                        <span class="weekly-day">
                            ${names[index]}
                        </span>

                    </div>
                `;

            }
        ).join("");


    const total =
        values.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    if (label) {

        label.textContent =
            `This week · ${formatDuration(total)}`;

    }

}


function renderStatisticsSubjects() {

    const container =
        document.getElementById(
            "statisticsSubjects"
        );


    if (!container) return;


    const total =
        getTotalStudyMinutes();


    const subjectMinutes =
        {};


    data.records.forEach(record => {

        subjectMinutes[
            record.subjectId
        ] =
            (
                subjectMinutes[
                    record.subjectId
                ] || 0
            ) +
            Number(record.minutes || 0);

    });


    const sorted =
        subjects
            .map(subject => ({
                ...subject,
                minutes:
                    subjectMinutes[
                        subject.id
                    ] || 0
            }))
            .sort(
                (a, b) =>
                    b.minutes -
                    a.minutes
            );


    container.innerHTML =
        sorted.map(subject => {

            const percentage =
                total > 0
                    ? Math.round(
                        subject.minutes /
                        total *
                        100
                    )
                    : 0;


            return `
                <div class="statistics-subject">

                    <div class="statistics-subject-row">

                        <strong>
                            ${subject.icon}
                            ${subject.name}
                        </strong>

                        <span>
                            ${formatDuration(subject.minutes)}
                            · ${percentage}%
                        </span>

                    </div>

                    <div class="statistics-progress">

                        <div
                            style="width:${percentage}%"
                        ></div>

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   TODO
========================================================= */

function getTodos() {

    if (!data.todos) {

        data.todos = [];

    }


    return data.todos;

}


let currentTodoFilter = "all";


function renderTodoSubjects() {

    const select =
        document.getElementById(
            "todoSubject"
        );


    if (!select) return;


    select.innerHTML = `
        <option value="">
            Select subject
        </option>

        ${subjects.map(subject => `
            <option value="${subject.id}">
                ${subject.icon}
                ${subject.name}
            </option>
        `).join("")}
    `;

}


function addTodo() {

    const subjectSelect =
        document.getElementById(
            "todoSubject"
        );


    const input =
        document.getElementById(
            "todoInput"
        );


    const dateInput =
        document.getElementById(
            "todoDate"
        );


    if (!input) return;


    const text =
        input.value.trim();


    const subjectId =
        subjectSelect?.value || "";


    const dueDate =
        dateInput?.value || dateKey();


    if (!text) {

        showToast(
            "Please enter a task."
        );

        return;

    }


    if (!subjectId) {

        showToast(
            "Please select a subject."
        );

        return;

    }


    getTodos().push({

        id:
            Date.now(),

        text,

        subjectId,

        dueDate,

        completed:
            false,

        createdAt:
            Date.now()

    });


    saveData();


    input.value = "";


    if (dateInput) {

        dateInput.value =
            dateKey();

    }


    renderTodos();

    showToast(
        "Todo added ✦"
    );

}


function renderTodos() {

    const container =
        document.getElementById(
            "todoList"
        );


    const count =
        document.getElementById(
            "todoCount"
        );


    if (!container) return;


    let todos =
        getTodos();


    if (
        currentTodoFilter ===
        "today"
    ) {

        todos =
            todos.filter(
                todo =>
                    todo.dueDate ===
                    dateKey()
            );

    }


    if (
        currentTodoFilter ===
        "pending"
    ) {

        todos =
            todos.filter(
                todo =>
                    !todo.completed
            );

    }


    if (
        currentTodoFilter ===
        "completed"
    ) {

        todos =
            todos.filter(
                todo =>
                    todo.completed
            );

    }


    todos =
        todos
            .slice()
            .sort(
                (a, b) => {

                    if (
                        a.completed !==
                        b.completed
                    ) {

                        return (
                            a.completed ? 1 : -1
                        );

                    }


                    return (
                        String(a.dueDate)
                            .localeCompare(
                                String(b.dueDate)
                            )
                    );

                }
            );


    if (count) {

        count.textContent =
            `${getTodos().filter(
                todo => !todo.completed
            ).length} pending`;

    }


    if (!todos.length) {

        container.innerHTML = `
            <div class="todo-empty">

                <span>✦</span>

                <p>
                    No tasks here
                </p>

                <small>
                    Add something you want to accomplish.
                </small>

            </div>
        `;

        return;

    }


    container.innerHTML =
        todos.map(todo => {

            const subject =
                subjects.find(
                    s =>
                        s.id ===
                        todo.subjectId
                );


            return `
                <div
                    class="todo-item
                    ${todo.completed ? "completed" : ""}"
                >

                    <button
                        class="todo-check"
                        onclick="toggleTodo(${todo.id})"
                        aria-label="Complete task"
                    >
                        ${
                            todo.completed
                                ? "✓"
                                : ""
                        }
                    </button>


                    <div class="todo-content">

                        <strong>
                            ${escapeHTML(todo.text)}
                        </strong>

                        <div>

                            <span class="todo-subject-tag">
                                ${subject?.icon || "📚"}
                                ${subject?.name || "Subject"}
                            </span>

                            <small>
                                ${formatTodoDate(todo.dueDate)}
                            </small>

                        </div>

                    </div>


                    <button
                        class="todo-delete"
                        onclick="deleteTodo(${todo.id})"
                        aria-label="Delete task"
                    >
                        ×
                    </button>

                </div>
            `;

        }).join("");

}


function formatTodoDate(value) {

    if (!value) return "";


    const date =
        new Date(
            value +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-MY",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


function toggleTodo(id) {

    const todo =
        getTodos().find(
            item =>
                item.id === id
        );


    if (!todo) return;


    todo.completed =
        !todo.completed;


    saveData();

    renderTodos();


    showToast(
        todo.completed
            ? "Task completed ✦"
            : "Task reopened"
    );

}


function deleteTodo(id) {

    data.todos =
        getTodos().filter(
            todo =>
                todo.id !== id
        );


    saveData();

    renderTodos();

    showToast(
        "Todo deleted"
    );

}


function escapeHTML(text) {

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* Todo button */

const addTodoBtn =
    document.getElementById(
        "addTodoBtn"
    );


if (addTodoBtn) {

    addTodoBtn.addEventListener(
        "click",
        addTodo
    );

}


/* Todo filters */

document
    .querySelectorAll(
        ".todo-filter-btn"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".todo-filter-btn"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                currentTodoFilter =
                    button.dataset.filter ||
                    "all";


                renderTodos();

            }
        );

    });

/* =========================================================
   FOCUS DAYS
========================================================= */

function getFocusDays() {

    const now = new Date();

    const year = now.getFullYear();

    const month = now.getMonth();


    return new Set(

        data.focusSessions

            .filter(session => {

                const d =
                    new Date(session.timestamp);

                return (
                    d.getFullYear() === year &&
                    d.getMonth() === month
                );

            })

            .map(
                session => session.date
            )

    ).size;

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const today =
        getTodayMinutes();

    const week =
        getWeekMinutes();

    const month =
        getMonthMinutes();


    document
        .getElementById("todayStudy")
        .textContent =
        formatDuration(today);

    document
        .getElementById("weekStudy")
        .textContent =
        formatDuration(week);

    document
        .getElementById("monthStudy")
        .textContent =
        formatDuration(month);


    const streak =
        getStudyStreak();

    document
        .getElementById("studyStreak")
        .textContent =
        `${streak} days`;


    const todayFocus =
        getTodayRecords()
            .filter(r => r.focus)
            .length;


    document
        .getElementById("todayFocus")
        .textContent =
        todayFocus;


    const focusMinutes =
        getTodayRecords()
            .filter(r => r.focus)
            .reduce(
                (sum, r) => sum + r.minutes,
                0
            );


    document
        .getElementById("todayFocusTime")
        .textContent =
        formatDuration(focusMinutes);


    /* goal */

    const goalMinutes =
        data.studyGoal * 60;

    const percentage =
        Math.min(
            100,
            today / goalMinutes * 100
        );


    document
        .getElementById("goalText")
        .textContent =
        `${formatDuration(today)} / ${data.studyGoal}h`;


    document
        .getElementById("goalProgress")
        .style.width =
        `${percentage}%`;


    /* points */

    document
        .getElementById("pointsSmall")
        .textContent =
        data.points;


    renderTodayRecords();

    renderRewardPreview();

}


/* =========================================================
   TODAY RECORDS
========================================================= */

function renderTodayRecords() {

    const container =
        document.getElementById("todayRecords");


    const records =
        getTodayRecords()
            .slice()
            .reverse()
            .slice(0, 7);


    if (!records.length) {

        container.innerHTML = `
            <div class="empty-state">
                <span>📖</span>
                <p>今天还没有学习记录</p>
                <small>Start your first focus session!</small>
            </div>
        `;

        return;

    }


    container.innerHTML =
        records.map(record => {

            const subject =
                subjects.find(
                    s => s.id === record.subjectId
                );


            return `
                <div class="record">

                    <div class="record-dot"></div>

                    <div class="record-info">

                        <strong>
                            ${subject?.icon || "📚"}
                            ${subject?.name || ""}
                        </strong>

                        <span>
                            ${subject?.type || "Unit"}
                            ${record.unit}
                            ${record.focus ? " · Focus" : ""}
                        </span>

                    </div>

                    <div class="record-time">
                        ${record.minutes} min
                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   HEATMAP
========================================================= */

function renderHeatmap() {

    const container =
        document.getElementById("heatmap");

    container.innerHTML = "";


    const now = new Date();

    document
        .getElementById("heatmapMonth")
        .textContent =
        now.toLocaleDateString(
            "en-MY",
            {
                month: "long",
                year: "numeric"
            }
        );


    const start =
        new Date(now);

    start.setDate(
        start.getDate() - 83
    );


    const mondayOffset =
        (start.getDay() + 6) % 7;

    start.setDate(
        start.getDate() - mondayOffset
    );


    for (let week = 0; week < 13; week++) {

        const column =
            document.createElement("div");

        column.className =
            "heat-column";


        for (let day = 0; day < 7; day++) {

            const current =
                new Date(start);

            current.setDate(
                start.getDate() +
                week * 7 +
                day
            );


            const key =
                dateKey(current);


            const minutes =
                data.records
                    .filter(
                        r => r.date === key
                    )
                    .reduce(
                        (sum, r) =>
                            sum + r.minutes,
                        0
                    );


            let level = 0;

            if (minutes >= 120) {
                level = 4;
            } else if (minutes >= 90) {
                level = 3;
            } else if (minutes >= 45) {
                level = 2;
            } else if (minutes > 0) {
                level = 1;
            }


            const cell =
                document.createElement("div");

            cell.className =
                `heat-cell level-${level}`;


            cell.title =
                `${key} · ${minutes} min`;


            cell.addEventListener(
                "click",
                () => showHeatmapDetail(key)
            );


            column.appendChild(cell);

        }


        container.appendChild(column);

    }

}


function showHeatmapDetail(key) {

    const records =
        data.records.filter(
            r => r.date === key
        );


    const total =
        records.reduce(
            (sum, r) => sum + r.minutes,
            0
        );


    const breakdown = {};


    records.forEach(record => {

        breakdown[record.subjectId] =
            (breakdown[record.subjectId] || 0)
            + record.minutes;

    });


    const subjectText =
        Object.entries(breakdown)
            .map(([id, min]) => {

                const subject =
                    subjects.find(
                        s => s.id === id
                    );

                return `${subject?.name || id}: ${min}m`;

            })
            .join(" · ");


    document
        .getElementById("heatmapDetail")
        .innerHTML =
        `<strong>${key}</strong> · ${total} min` +
        (subjectText
            ? `<br>${subjectText}`
            : `<br>No study record`);

}


/* =========================================================
   SUBJECTS
========================================================= */

function getSubjectProgress(subject) {

    const units =
        data.unitData[subject.id];


    const completed =
        Object.values(units)
            .filter(
                unit =>
                    unit.status === "completed"
            )
            .length;


    return {
        completed,
        percentage:
            Math.round(
                completed /
                subject.total *
                100
            )
    };

}


function renderSubjects() {

    const container =
        document.getElementById("subjectsGrid");


    container.innerHTML =
        subjects.map(subject => {

            const progress =
                getSubjectProgress(subject);


            return `
                <div class="subject-card">

                    <div class="subject-top">

                        <div class="subject-icon">
                            ${subject.icon}
                        </div>

                        <div class="subject-info">
                            <h3>${subject.name}</h3>
                            <span>
                                ${subject.total}
                                ${subject.type}s
                            </span>
                        </div>

                        <div class="subject-percent">
                            ${progress.percentage}%
                        </div>

                    </div>

                    <div class="progress-bar">
                        <div style="width:${progress.percentage}%"></div>
                    </div>

                    <div class="subject-footer">

                        <span>
                            ${progress.completed}/${subject.total}
                            completed
                        </span>

                        <button
                            class="view-btn"
                            onclick="openSubject('${subject.id}')"
                        >
                            View Units →
                        </button>

                    </div>

                </div>
            `;

        }).join("");

}


let currentSubjectId = null;

let currentUnit = null;


function openSubject(subjectId) {

    currentSubjectId =
        subjectId;

    const subject =
        subjects.find(
            s => s.id === subjectId
        );


    const container =
        document.getElementById("subjectsGrid");


    container.innerHTML =
        subjects.map(subject => {

            const progress =
                getSubjectProgress(subject);


            return `
                <div class="subject-card">

                    <div class="subject-top">

                        <div class="subject-icon">
                            ${subject.icon}
                        </div>

                        <div class="subject-info">
                            <h3>${subject.name}</h3>
                            <span>
                                ${subject.total}
                                ${subject.type}
                            </span>
                        </div>

                        <div class="subject-percent">
                            ${progress.percentage}%
                        </div>

                    </div>

                    <div class="progress-bar">
                        <div style="width:${progress.percentage}%"></div>
                    </div>

                    <div
                        class="unit-list"
                        style="
                            margin-top:20px;
                            display:grid;
                            grid-template-columns:
                            repeat(5,1fr);
                            gap:7px;
                        "
                    >

                        ${Array.from(
                            { length: subject.total },
                            (_, i) => {

                                const number = i + 1;

                                const unit =
                                    data.unitData[
                                        subject.id
                                    ][number];


                                let icon = "⬜";

                                if (
                                    unit.status ===
                                    "learning"
                                ) icon = "🟡";

                                if (
                                    unit.status ===
                                    "completed"
                                ) icon = "🟢";


                                return `
                                    <button
                                        onclick="
                                            openUnit(
                                                '${subject.id}',
                                                ${number}
                                            )
                                        "
                                        style="
                                            padding:9px 4px;
                                            border-radius:9px;
                                            background:
                                                var(--blue-soft);
                                            font-size:10px;
                                        "
                                    >
                                        ${icon}
                                        ${number}
                                    </button>
                                `;

                            }
                        ).join("")}

                    </div>

                </div>
            `;

        }).join("");


    showPage("subjects");

}


function openUnit(subjectId, unitNumber) {

    currentSubjectId =
        subjectId;

    currentUnit =
        unitNumber;


    const subject =
        subjects.find(
            s => s.id === subjectId
        );


    const unit =
        data.unitData[
            subjectId
        ][unitNumber];


    document
        .getElementById("unitSubjectName")
        .textContent =
        `${subject.icon} ${subject.name}`;


    document
        .getElementById("unitDetailTitle")
        .textContent =
        `${subject.type} ${unitNumber}`;


    document
        .querySelectorAll(".status-option")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.status ===
                unit.status
            );

        });


    document
        .getElementById("revisionCheck")
        .checked =
        unit.revision;


    document
        .getElementById("notesCheck")
        .checked =
        unit.notes;


    document
        .getElementById("practiceCheck")
        .checked =
        unit.practice;


    updateUnitProgress();


    showPage("unitDetail");

}


function updateUnitProgress() {

    if (!currentSubjectId ||
        !currentUnit) return;


    const unit =
        data.unitData[
            currentSubjectId
        ][currentUnit];


    let progress = 0;


    if (unit.status === "learning") {
        progress = 50;
    }

    if (unit.status === "completed") {
        progress = 100;
    }


    if (unit.revision) progress += 0;

    if (unit.notes) progress += 0;

    if (unit.practice) progress += 0;


    document
        .getElementById("unitProgressText")
        .textContent =
        `${progress}%`;


    document
        .getElementById("unitProgressBar")
        .style.width =
        `${progress}%`;


    saveData();

}


document
    .querySelectorAll(".status-option")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (!currentSubjectId ||
                    !currentUnit) return;


                data.unitData[
                    currentSubjectId
                ][currentUnit]
                    .status =
                    button.dataset.status;


                openUnit(
                    currentSubjectId,
                    currentUnit
                );


                renderSubjects();

            }
        );

    });


["revisionCheck", "notesCheck", "practiceCheck"]
    .forEach(id => {

        document
            .getElementById(id)
            .addEventListener(
                "change",
                event => {

                    if (!currentSubjectId ||
                        !currentUnit) return;


                    const key = {
                        revisionCheck: "revision",
                        notesCheck: "notes",
                        practiceCheck: "practice"
                    }[id];


                    data.unitData[
                        currentSubjectId
                    ][currentUnit][key] =
                        event.target.checked;


                    updateUnitProgress();

                }
            );

    });


document
    .getElementById("backSubjects")
    .addEventListener(
        "click",
        () => {

            renderSubjects();

            showPage("subjects");

        }
    );


document
    .getElementById("startUnitFocus")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("focusSubject")
                .value =
                currentSubjectId;


            populateFocusUnits();

            document
                .getElementById("focusUnit")
                .value =
                currentUnit;


            showPage("focus");

        }
    );


/* =========================================================
   FOCUS TIMER
========================================================= */

let timer = {

    running: false,

    mode: "countup",

    elapsed: 0,

    remaining: 0,

    interval: null

};


function updateTimerDisplay() {

    let seconds;


    if (
        timer.mode ===
        "countdown" ||
        timer.mode ===
        "pomodoro"
    ) {

        seconds =
            Math.max(
                0,
                timer.remaining
            );

    } else {

        seconds =
            timer.elapsed;

    }


    const h =
        Math.floor(
            seconds / 3600
        );

    const m =
        Math.floor(
            (seconds % 3600) / 60
        );

    const s =
        seconds % 60;


    document
        .getElementById("timerDisplay")
        .textContent =
        `${String(h).padStart(2,"0")}:` +
        `${String(m).padStart(2,"0")}:` +
        `${String(s).padStart(2,"0")}`;

}


function startTimer() {

    if (timer.running) return;


    if (
        timer.mode === "countdown" &&
        timer.remaining <= 0
    ) {

        const minutes =
            Number(
                document
                    .getElementById(
                        "countdownMinutes"
                    )
                    .value
            ) || 25;


        timer.remaining =
            minutes * 60;

    }


    if (
        timer.mode === "pomodoro" &&
        timer.remaining <= 0
    ) {

        timer.remaining = 25 * 60;

    }


    timer.running = true;


    timer.interval =
        setInterval(
            () => {

                if (
                    timer.mode ===
                    "countdown" ||
                    timer.mode ===
                    "pomodoro"
                ) {

                    timer.remaining--;

                    if (
                        timer.remaining <= 0
                    ) {

                        finishTimer();

                    }

                } else {

                    timer.elapsed++;

                }


                updateTimerDisplay();

            },
            1000
        );


    document
        .getElementById("timerSub")
        .textContent =
        "Stay focused 💙";


}


function pauseTimer() {

    if (!timer.running) return;


    clearInterval(
        timer.interval
    );

    timer.running = false;


    document
        .getElementById("timerSub")
        .textContent =
        "Paused";


}


function resetTimer() {

    clearInterval(
        timer.interval
    );


    timer.running = false;

    timer.elapsed = 0;

    timer.remaining = 0;


    updateTimerDisplay();


    document
        .getElementById("timerSub")
        .textContent =
        "Ready when you are";

}


function finishTimer() {

    clearInterval(
        timer.interval
    );


    timer.running = false;


    const minutes =
        Math.max(
            1,
            Math.round(
                timer.mode === "countup"
                    ? timer.elapsed / 60
                    : (
                        timer.mode === "pomodoro"
                            ? 25
                            : Number(
                                document
                                    .getElementById(
                                        "countdownMinutes"
                                    )
                                    .value
                            )
                    )
            )
        );


    const subjectId =
        document
            .getElementById(
                "focusSubject"
            )
            .value;


    const unit =
        Number(
            document
                .getElementById(
                    "focusUnit"
                )
                .value
        );


    if (subjectId) {

        addStudyRecord({
            subjectId,
            unit,
            minutes,
            focus: true
        });


        /* auto learning */

        if (
            data.unitData[
                subjectId
            ]?.[unit]
        ) {

            const current =
                data.unitData[
                    subjectId
                ][unit];


            if (
                current.status ===
                "not-started"
            ) {

                current.status =
                    "learning";

            }

        }

    }


    timer.elapsed = 0;

    timer.remaining = 0;

    updateTimerDisplay();


    document
        .getElementById("timerSub")
        .textContent =
        "Session completed ✦";


    renderAll();

}


document
    .getElementById("timerStart")
    .addEventListener(
        "click",
        startTimer
    );


document
    .getElementById("timerPause")
    .addEventListener(
        "click",
        pauseTimer
    );


document
    .getElementById("timerReset")
    .addEventListener(
        "click",
        resetTimer
    );


document
    .querySelectorAll(".timer-mode-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                pauseTimer();


                document
                    .querySelectorAll(
                        ".timer-mode-btn"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                timer.mode =
                    button.dataset.mode;


                resetTimer();

            }
        );

    });


/* =========================================================
   FOCUS SUBJECT SELECTOR
========================================================= */

function populateFocusSubjects() {

    const select =
        document.getElementById(
            "focusSubject"
        );


    select.innerHTML =
        subjects.map(subject =>
            `
                <option value="${subject.id}">
                    ${subject.icon} ${subject.name}
                </option>
            `
        ).join("");


    populateFocusUnits();

}


function populateFocusUnits() {

    const subjectId =
        document
            .getElementById(
                "focusSubject"
            )
            .value;


    const subject =
        subjects.find(
            s => s.id === subjectId
        );


    const select =
        document.getElementById(
            "focusUnit"
        );


    select.innerHTML =
        Array.from(
            {
                length:
                    subject?.total || 10
            },
            (_, index) =>
                `
                <option value="${index + 1}">
                    ${subject?.type || "Unit"}
                    ${index + 1}
                </option>
                `
        ).join("");

}


document
    .getElementById("focusSubject")
    .addEventListener(
        "change",
        populateFocusUnits
    );


/* =========================================================
   REWARDS
========================================================= */

const rewards = [

    {
        icon: "🎵",
        name: "Music / Stage",
        cost: 30,
        description: "Enjoy 30 minutes of music or stage content."
    },

    {
        icon: "📺",
        name: "Related Video",
        cost: 50,
        description: "Watch one related study or interest video."
    },

    {
        icon: "💙",
        name: "Fan Time",
        cost: 100,
        description: "Enjoy 30 minutes of your favourite content."
    },

    {
        icon: "⭐",
        name: "Favourite Stage",
        cost: 200,
        description: "Watch your favourite stage as a reward."
    },

    {
        icon: "👑",
        name: "Special Reward",
        cost: 500,
        description: "Your own special reward!"
    }

];


function renderRewardPreview() {

    let next =
        rewards.find(
            reward =>
                data.points < reward.cost
        );


    if (!next) {

        next =
            rewards[rewards.length - 1];

    }


    const progress =
        Math.min(
            100,
            data.points /
            next.cost *
            100
        );


    document
        .getElementById(
            "nextRewardName"
        )
        .textContent =
        `${next.cost} points · ${next.name}`;


    document
        .getElementById(
            "nextRewardProgress"
        )
        .textContent =
        `${data.points} / ${next.cost} points`;


    document
        .getElementById(
            "rewardProgress"
        )
        .style.width =
        `${progress}%`;

}


function renderRewards() {

    document
        .getElementById(
            "pointsTotal"
        )
        .innerHTML =
        `⭐ <strong>${data.points}</strong> points`;


    document
        .getElementById(
            "rewardsGrid"
        )
        .innerHTML =
        rewards.map(reward => {

            const unlocked =
                data.points >= reward.cost;


            return `
                <div
                    class="
                        reward-card
                        ${unlocked ? "" : "locked"}
                    "
                >

                    <div class="reward-card-icon">
                        ${reward.icon}
                    </div>

                    <h3>
                        ${reward.name}
                    </h3>

                    <p>
                        ${reward.description}
                    </p>

                    <div class="reward-cost">
                        ⭐ ${reward.cost} points
                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

const achievements = [

    {
        icon: "💧",
        name: "初落",
        description: "Complete your first study session",
        check: () =>
            data.records.length >= 1
    },

    {
        icon: "💙",
        name: "成流",
        description: "Study for 7 consecutive days.",
        check: () =>
            getStudyStreak() >= 7
    },

    {
        icon: "🔥",
        name: "不息",
        description: "Study for 30 consecutive days.",
        check: () =>
            getStudyStreak() >= 30
    },

    {
        icon: "⭐",
        name: "成章",
        description: "Reach 50 focus hours.",
        check: () =>
            data.focusSessions
                .reduce(
                    (sum, r) =>
                        sum + r.minutes,
                    0
                ) >= 3000
    },

    {
        icon: "👑",
        name: "成光",
        description: "Reach 100 focus hours.",
        check: () =>
            data.focusSessions
                .reduce(
                    (sum, r) =>
                        sum + r.minutes,
                    0
                ) >= 6000
    }

];


function renderAchievements() {

    document
        .getElementById(
            "achievementsGrid"
        )
        .innerHTML =
        achievements.map(
            achievement => {

                const unlocked =
                    achievement.check();


                return `
                    <div
                        class="
                            achievement
                            ${unlocked ? "" : "locked"}
                        "
                    >

                        ${
                            unlocked
                                ? `<span class="unlocked-badge">
                                    ✓ UNLOCKED
                                   </span>`
                                : ""
                        }

                        <div class="achievement-icon">
                            ${achievement.icon}
                        </div>

                        <h3>
                            ${achievement.name}
                        </h3>

                        <p>
                            ${achievement.description}
                        </p>

                    </div>
                `;

            }
        ).join("");

}


/* =========================================================
   SPOTIFY
========================================================= */

document
    .getElementById("loadSpotify")
    .addEventListener(
        "click",
        () => {

            const url =
                document
                    .getElementById(
                        "spotifyUrl"
                    )
                    .value
                    .trim();


            if (!url) {

                showToast(
                    "Please paste a Spotify link."
                );

                return;

            }


            let embedUrl =
                url;


            if (
                url.includes(
                    "open.spotify.com"
                )
            ) {

                embedUrl =
                    url.replace(
                        "open.spotify.com/",
                        "open.spotify.com/embed/"
                    );

            }


            document
                .getElementById(
                    "spotifyPlayer"
                )
                .innerHTML = `
                    <iframe
                        src="${embedUrl}"
                        width="100%"
                        height="190"
                        frameborder="0"
                        allow="
                            autoplay;
                            clipboard-write;
                            encrypted-media;
                            fullscreen;
                            picture-in-picture
                        "
                        loading="lazy"
                        style="
                            border-radius:12px;
                            border:0;
                        "
                    ></iframe>
                `;

        }
    );


/* =========================================================
   SETTINGS
========================================================= */

document
    .getElementById("studyGoal")
    .addEventListener(
        "change",
        event => {

            data.studyGoal =
                Number(event.target.value)
                || 3;


            saveData();

            renderDashboard();

            showToast(
                "Study goal updated ✦"
            );

        }
    );


function applyTheme() {

    const dark =
        data.theme === "dark";


    document
        .body
        .classList.toggle(
            "dark",
            dark
        );


    document
        .getElementById(
            "darkMode"
        )
        .checked =
        dark;

}


document
    .getElementById("darkMode")
    .addEventListener(
        "change",
        event => {

            data.theme =
                event.target.checked
                    ? "dark"
                    : "light";


            saveData();

            applyTheme();

        }
    );


document
    .getElementById("mobileTheme")
    .addEventListener(
        "click",
        () => {

            data.theme =
                data.theme === "dark"
                    ? "light"
                    : "dark";


            saveData();

            applyTheme();

        }
    );


/* =========================================================
   PHOTO UPLOAD
========================================================= */

document
    .getElementById("photoUpload")
    .addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) return;


            const reader =
                new FileReader();


            reader.onload =
                () => {

                    data.photo =
                        reader.result;


                    saveData();

                    renderPhoto();

                    showToast(
                        "Profile photo updated 💙"
                    );

                };


            reader.readAsDataURL(file);

        }
    );


function renderPhoto() {

    const img =
        document.getElementById(
            "profilePhoto"
        );

    const placeholder =
        document.getElementById(
            "photoPlaceholder"
        );


    if (data.photo) {

        img.src =
            data.photo;

        img.classList.add("show");

        placeholder.style.display =
            "none";

    } else {

        img.classList.remove("show");

        placeholder.style.display =
            "block";

    }

}


/* =========================================================
   RESET
========================================================= */

document
    .getElementById("resetData")
    .addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "确定要删除全部学习记录吗？此操作无法恢复。"
                );


            if (!confirmed) return;


            data =
                createDefaultData();


            saveData();

            applyTheme();

            renderAll();

            showToast(
                "All study data has been reset."
            );

        }
    );


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    document
        .getElementById("studyGoal")
        .value = data.studyGoal;

    renderDashboard();

    renderSubjects();

    renderHeatmap();

    renderCalendar();

    renderStatistics();

    renderTodoSubjects();

    renderTodos();

    renderRewards();

    renderAchievements();

    renderPhoto();

    // Set Todo date to today
    const todoDate = document.getElementById("todoDate");

    if (todoDate && !todoDate.value) {
        todoDate.value = dateKey();
    }
}


/* =========================================================
   INITIALIZE APP
========================================================= */

populateFocusSubjects();

applyTheme();

renderAll();

updateTimerDisplay();


/* =========================================================
   AUTO SAVE
========================================================= */

setInterval(() => {
    saveData();
}, 30000);