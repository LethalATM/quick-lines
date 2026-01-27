let shows = JSON.parse(localStorage.getItem("quickLinesShows")) || [];
let activeShowIndex = null;
let filterType = "all";

let streak = JSON.parse(localStorage.getItem("quickLinesStreak")) || {
  count: 0,
  lastDate: null
};

function save() {
  localStorage.setItem("quickLinesShows", JSON.stringify(shows));
  localStorage.setItem("quickLinesStreak", JSON.stringify(streak));
}

/* ===== STREAK ===== */

function updateStreak() {
  const today = new Date().toDateString();
  if (streak.lastDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (streak.lastDate === yesterday.toDateString()) {
    streak.count++;
  } else {
    streak.count = 1;
  }

  streak.lastDate = today;
  save();
}

/* ===== SHOWS ===== */

function addShow() {
  const input = document.getElementById("showTitle");
  if (!input.value.trim()) return;

  shows.push({ title: input.value, lines: [] });
  input.value = "";
  activeShowIndex = shows.length - 1;
  save();
  render();
}

function removeShow(index) {
  if (!confirm("Delete this show?")) return;
  shows.splice(index, 1);
  activeShowIndex = Math.max(0, shows.length - 1);
  save();
  render();
}

/* ===== LINES ===== */

function addLine(showIndex) {
  const input = document.getElementById("lineInput");
  const type = document.getElementById("lineType").value;
  if (!input.value.trim()) return;

  shows[showIndex].lines.push({
    text: input.value,
    memorized: false,
    hidden: false,
    type
  });

  input.value = "";
  save();
  render();
}

function removeLine(s, l) {
  shows[s].lines.splice(l, 1);
  save();
  render();
}

function toggleLine(s, l) {
  shows[s].lines[l].memorized = !shows[s].lines[l].memorized;
  save();
  render();
}

function toggleHidden(s, l) {
  shows[s].lines[l].hidden = !shows[s].lines[l].hidden;
  save();
  render();
}

/* ===== PRACTICE ===== */

function startTimedPractice() {
  updateStreak();

  const seconds = parseInt(document.getElementById("practiceSeconds").value);
  if (!seconds) return;

  const show = shows[activeShowIndex];
  show.lines.forEach(l => l.hidden = true);
  save();
  render();

  show.lines.forEach((l, i) => {
    setTimeout(() => {
      l.hidden = false;
      save();
      render();
    }, seconds * 1000 * (i + 1));
  });
}

/* ===== RENDER ===== */

function render() {
  const tabs = document.getElementById("showTabs");
  const container = document.getElementById("shows");
  tabs.innerHTML = "";
  container.innerHTML = "";

  if (activeShowIndex === null && shows.length > 0) activeShowIndex = 0;
  if (shows.length === 0) return;

  shows.forEach((show, i) => {
    const tab = document.createElement("button");
    tab.textContent = show.title;
    if (i === activeShowIndex) tab.style.background = "#e63946";
    tab.onclick = () => { activeShowIndex = i; render(); };
    tabs.appendChild(tab);
  });

  const show = shows[activeShowIndex];
  const div = document.createElement("div");
  div.className = "show";

  const title = document.createElement("h2");
  title.textContent = show.title;

  const progress = document.createElement("p");
  const mem = show.lines.filter(l => l.memorized).length;
  progress.textContent = `Progress: ${mem}/${show.lines.length}`;

  const streakDisplay = document.createElement("p");
  streakDisplay.textContent = `🔥 Practice Streak: ${streak.count} day${streak.count === 1 ? "" : "s"}`;

  const practiceInput = document.createElement("input");
  practiceInput.id = "practiceSeconds";
  practiceInput.type = "number";
  practiceInput.placeholder = "Seconds per line";

  const practiceBtn = document.createElement("button");
  practiceBtn.textContent = "🎧 Timed Practice";
  practiceBtn.onclick = startTimedPractice;

  const typeSelect = document.createElement("select");
  typeSelect.id = "lineType";
  typeSelect.innerHTML = `
    <option value="lyric">🎶 Lyric</option>
    <option value="dialogue">🎭 Dialogue</option>
  `;

  const filterDiv = document.createElement("div");
  ["all","lyric","dialogue"].forEach(t => {
    const b = document.createElement("button");
    b.textContent = t === "all" ? "All" : t === "lyric" ? "🎶 Lyrics" : "🎭 Dialogue";
    b.onclick = () => { filterType = t; render(); };
    filterDiv.appendChild(b);
  });

  const lineInput = document.createElement("input");
  lineInput.id = "lineInput";
  lineInput.placeholder = "Add a line";

  const addLineBtn = document.createElement("button");
  addLineBtn.textContent = "Add Line";
  addLineBtn.onclick = () => addLine(activeShowIndex);

  div.append(
    title,
    progress,
    streakDisplay,
    practiceInput,
    practiceBtn,
    filterDiv,
    typeSelect,
    lineInput,
    addLineBtn
  );

  show.lines.forEach((line, i) => {
    if (filterType !== "all" && line.type !== filterType) return;

    const lineDiv = document.createElement("div");
    lineDiv.className = "line";

    const text = document.createElement("span");
    text.textContent =
      `${line.memorized ? "✅" : "⬜"} ${line.type === "lyric" ? "🎶" : "🎭"} ` +
      `${line.hidden ? "••••••••••" : line.text}`;

    const memBtn = document.createElement("button");
    memBtn.textContent = "Memorized";
    memBtn.onclick = () => toggleLine(activeShowIndex, i);

    const hideBtn = document.createElement("button");
    hideBtn.textContent = line.hidden ? "Reveal" : "Hide";
    hideBtn.onclick = () => toggleHidden(activeShowIndex, i);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Remove";
    delBtn.onclick = () => removeLine(activeShowIndex, i);

    lineDiv.append(text, memBtn, hideBtn, delBtn);
    div.appendChild(lineDiv);
  });

  container.appendChild(div);
}

document.getElementById("addShowBtn").onclick = addShow;
render();
