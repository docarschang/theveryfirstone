const STORAGE_KEY = "todo-list-items";

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const remainingCount = document.querySelector("#remaining-count");
const selectedDateInput = document.querySelector("#selected-date");
const previousDayButton = document.querySelector("#previous-day");
const nextDayButton = document.querySelector("#next-day");
const todayButton = document.querySelector("#go-today");
const chineseQuote = document.querySelector("#quote-chinese");
const englishQuote = document.querySelector("#quote-english");

const dailyQuotes = [
  { chinese: "每一步都算數，繼續走就會抵達。", english: "Every step counts. Keep going, and you will get there." },
  { chinese: "不必一次完成全部，只要開始下一步。", english: "You do not have to finish it all at once. Just take the next step." },
  { chinese: "今天的努力，正在成為明天的底氣。", english: "What you work on today becomes your strength tomorrow." },
  { chinese: "慢慢來也沒關係，重要的是沒有停下。", english: "It is okay to go slowly. What matters is that you keep moving." },
  { chinese: "你已經比昨天的自己更向前一步。", english: "You are one step further than you were yesterday." },
  { chinese: "把注意力放在眼前，答案會逐漸清晰。", english: "Focus on what is in front of you, and clarity will follow." },
  { chinese: "小小的進展，也值得好好肯定。", english: "Small progress is still progress, and it deserves recognition." },
  { chinese: "相信累積的力量，時間會看見你的用心。", english: "Trust what you are building. Time will show your care." },
  { chinese: "休息一下，再出發也算前進。", english: "Taking a break before you begin again is still moving forward." },
  { chinese: "你不需要完美，只需要願意開始。", english: "You do not need to be perfect. You only need to begin." },
];

// 使用本地年月日，避免 UTC 時區造成日期偏移。
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = getLocalDateString();
selectedDateInput.value = today;

// 從瀏覽器儲存空間載入清單；資料格式異常時改用空清單。
function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(savedTodos) ? savedTodos : [];
  } catch {
    return [];
  }
}

let todos = loadTodos()
  .filter((todo) => todo && typeof todo.id === "string" && typeof todo.text === "string")
  .map((todo) => ({
    ...todo,
    date: /^\d{4}-\d{2}-\d{2}$/.test(todo.date) ? todo.date : today,
  }));

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // 儲存空間不可用時仍保留本次頁面操作。
  }
}

saveTodos();

function renderTodos() {
  todoList.replaceChildren();
  const selectedTodos = todos.filter((todo) => todo.date === selectedDateInput.value);
  const [year, month, day] = selectedDateInput.value.split("-").map(Number);
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  const quoteIndex = ((dayNumber % dailyQuotes.length) + dailyQuotes.length) % dailyQuotes.length;
  chineseQuote.textContent = dailyQuotes[quoteIndex].chinese;
  englishQuote.textContent = dailyQuotes[quoteIndex].english;

  selectedTodos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item";
    if (todo.completed) item.classList.add("is-completed");

    const checkbox = document.createElement("input");
    checkbox.className = "todo-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(todo.completed);
    checkbox.setAttribute("aria-label", `標記「${todo.text}」為${todo.completed ? "未完成" : "已完成"}`);
    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `刪除「${todo.text}」`);
    deleteButton.title = "刪除待辦事項";
    deleteButton.addEventListener("click", () => {
      todos = todos.filter((entry) => entry.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    item.append(checkbox, text, deleteButton);
    todoList.append(item);
  });

  emptyState.hidden = selectedTodos.length > 0;
  const incompleteCount = selectedTodos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `未完成:${incompleteCount} 項`;
}

function changeSelectedDate(dayOffset) {
  const selectedDate = new Date(`${selectedDateInput.value || today}T12:00:00`);
  selectedDate.setDate(selectedDate.getDate() + dayOffset);
  selectedDateInput.value = getLocalDateString(selectedDate);
  renderTodos();
}

selectedDateInput.addEventListener("change", () => {
  if (!selectedDateInput.value) selectedDateInput.value = today;
  renderTodos();
});
previousDayButton.addEventListener("click", () => changeSelectedDate(-1));
nextDayButton.addEventListener("click", () => changeSelectedDate(1));
todayButton.addEventListener("click", () => {
  selectedDateInput.value = today;
  renderTodos();
});

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  todos.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
    completed: false,
    date: selectedDateInput.value,
  });
  saveTodos();
  renderTodos();
  todoForm.reset();
  todoInput.focus();
});

renderTodos();