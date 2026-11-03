/* =========================================================
   tasks.js  -  WHAT HAPPENS WHEN YOU USE THE TASKS PAGE
   Idea: keep all the data in one list (the "tasks" array).
   Whenever something changes, change the data, then call render()
   which redraws the page from that data. This is how most apps work.
   ========================================================= */

/* 1. DATA - the only place the sample content lives */
// Initials match the mockup. Names are placeholders: replace with your real roommates.
const PEOPLE = {
  SA: { name: "Sam",  color: "c1" },
  MI: { name: "Mia",  color: "c2" },
  YO: { name: "You",  color: "c1" },
  EM: { name: "Emma", color: "c3" }
};
const ME = "YO";

let tasks = [
  { id: 1, name: "Take bins out",        when: "Today · 8:00 PM",     who: "SA", done: false },
  { id: 2, name: "Water the plants",     when: "Living room",              who: "MI", done: false },
  { id: 3, name: "Wipe kitchen counters", when: "Anytime today",           who: "YO", done: true  },
  { id: 4, name: "Vacuum hallway",       when: "Tomorrow · 10:00 AM", who: "EM", done: false },
  { id: 5, name: "Laundry",              when: "Anytime this week",        who: "YO", done: false }
];
let nextId = 6;
let filter = "all";

/* 2. SHORTCUTS */
const $ = (selector) => document.querySelector(selector);
const list = $("#taskList");

/* A small pop-up message at the bottom of the screen */
let toastTimer;
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

/* 3. DRAW THE PAGE FROM THE DATA */
const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>';
const CHEVRON_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';

function isVisible(task) {
  if (filter === "mine") return task.who === ME;
  if (filter === "done") return task.done;
  return true; // "all"
}

function taskHTML(task) {
  const person = PEOPLE[task.who];
  const sub = task.done ? "Completed today" : task.when;
  return `
    <li class="task ${task.done ? "done" : ""}" data-id="${task.id}">
      <div class="task-row">
        <button class="check" data-action="toggle" aria-pressed="${task.done}"
                aria-label="Mark ${task.name} as ${task.done ? "not done" : "done"}">${CHECK_SVG}</button>
        <div>
          <div class="task-name">${task.name}</div>
          <div class="task-sub">${sub}</div>
        </div>
        <span class="avatar sm ${person.color}" title="${person.name}">${task.who}</span>
        <button class="chev" data-action="expand" aria-expanded="false" aria-label="Details for ${task.name}">${CHEVRON_SVG}</button>
      </div>
      <div class="detail">
        <span>Assigned to ${person.name}</span>
        <button class="remind" data-action="remind">${task.who === ME ? "Remind me" : "Remind " + person.name}</button>
      </div>
    </li>`;
}

function render() {
  const visible = tasks.filter(isVisible);
  list.innerHTML = visible.map(taskHTML).join("");
  $("#empty").hidden = visible.length > 0;
  list.hidden = visible.length === 0;

  // Progress card and ring always use ALL tasks, not just the filtered ones
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  $("#doneCount").textContent = done;
  $("#totalCount").textContent = total;
  $("#percent").textContent = percent + "%";
  // The ring's circle is 201 units around; offset = the part left EMPTY
  $("#ringFg").style.strokeDashoffset = 201 - (201 * percent) / 100;
  $("#ring").setAttribute("aria-label", percent + " percent complete");
}

/* 4. CLICKS (one listener on the list handles every button inside it) */
list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const row = button.closest(".task");
  const task = tasks.find((t) => t.id === Number(row.dataset.id));

  if (button.dataset.action === "toggle") {
    task.done = !task.done;
    toast(task.done ? "Nice, \"" + task.name + "\" is done." : "Marked as not done.");
    render();
  }
  if (button.dataset.action === "expand") {
    const open = row.querySelector(".detail").classList.toggle("open");
    button.setAttribute("aria-expanded", open);
  }
  if (button.dataset.action === "remind") {
    toast("Reminder sent to " + PEOPLE[task.who].name + ".");
  }
});

/* 5. FILTER DROPDOWN */
$("#filter").addEventListener("change", (event) => {
  filter = event.target.value;
  render();
});

/* 6. ADD TASK (the pop-up form) */
const dialog = $("#addDialog");
$("#taskWho").innerHTML = Object.keys(PEOPLE)
  .map((key) => `<option value="${key}">${PEOPLE[key].name}</option>`).join("");

$("#addBtn").addEventListener("click", () => {
  $("#addForm").reset();
  dialog.showModal();
});
$("#cancelAdd").addEventListener("click", () => dialog.close());
$("#addForm").addEventListener("submit", () => {
  const name = $("#taskName").value.trim();
  if (!name) return;
  tasks.push({ id: nextId++, name: name, when: $("#taskWhen").value, who: $("#taskWho").value, done: false });
  toast("Task added.");
  render();
});

/* 7. BELL */
$("#bellBtn").addEventListener("click", () => {
  const open = tasks.filter((t) => !t.done && t.who === ME).length;
  toast(open ? "You have " + open + " task" + (open > 1 ? "s" : "") + " to do." : "You're all caught up!");
});

/* 8. START: draw the page for the first time */
render();
