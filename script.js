document.addEventListener("DOMContentLoaded", () => {

  // ---------- State ----------
  let shows = JSON.parse(localStorage.getItem("quickLinesShows")) || [];
  let currentShow = null;

  // ---------- Utilities ----------
  function save() {
    localStorage.setItem("quickLinesShows", JSON.stringify(shows));
  }

  function getCharacters(show) {
    return [...new Set(show.lines.map(l => l.character).filter(Boolean))];
  }

  // ---------- Render ----------
  function render() {
    const tabs = document.getElementById("showTabs");
    const editor = document.getElementById("editor");
    const linesDiv = document.getElementById("lines");
    const title = document.getElementById("currentShowTitle");
    const charSelect = document.getElementById("practiceCharacter");

    // Render show tabs
    tabs.innerHTML = "";
    shows.forEach((show, index) => {
      const btn = document.createElement("button");
      btn.textContent = show.name;
      btn.onclick = () => {
        currentShow = index;
        render();
      };
      tabs.appendChild(btn);
    });

    // No show selected
    if (currentShow === null) {
      editor.style.display = "none";
      return;
    }

    // Show editor
    const show = shows[currentShow];
    editor.style.display = "block";
    title.textContent = show.name;

    // Render lines
    linesDiv.innerHTML = "";
    show.lines.forEach(line => {
      const div = document.createElement("div");
      div.textContent = `${line.character}: ${line.text}`;
      linesDiv.appendChild(div);
    });

    // Practice character dropdown
    charSelect.innerHTML = "";
    getCharacters(show).forEach(char => {
      const opt = document.createElement("option");
      opt.value = char;
      opt.textContent = char;
      charSelect.appendChild(opt);
    });
  }

  // ---------- Actions ----------
  function addShow() {
    const input = document.getElementById("showInput");
    const name = input.value.trim();
    if (!name) return;

    shows.push({ name, lines: [] });
    input.value = "";
    save();
    render();
  }

  function addLine() {
    if (currentShow === null) return;

    const character = document.getElementById("characterInput").value.trim();
    const text = document.getElementById("lineInput").value.trim();
    if (!character || !text) return;

    shows[currentShow].lines.push({
      character,
      text,
      memorized: false,
      hidden: false
    });

    document.getElementById("characterInput").value = "";
    document.getElementById("lineInput").value = "";

    save();
    render();
  }

  // ---------- Practice Mode ----------
  function startPractice() {
    const myCharacter = document.getElementById("practiceCharacter").value;
    const overlay = document.getElementById("practiceOverlay");
    const area = document.getElementById("practiceArea");
    const show = shows[currentShow];

    overlay.classList.remove("hidden");
    area.innerHTML = "";

    show.lines.forEach(line => {
      const div = document.createElement("div");

      if (line.character === myCharacter) {
        div.textContent = "⬛⬛⬛ YOUR LINE ⬛⬛⬛";
        div.className = "my-line";
        div.onclick = () => {
          div.textContent = `${line.character}: ${line.text}`;
        };
      } else {
        div.textContent = `${line.character}: ${line.text}`;
        div.className = "cue-line";
      }

      area.appendChild(div);
    });
  }

  function exitPractice() {
    document.getElementById("practiceOverlay").classList.add("hidden");
  }

  // ---------- Event Wiring ----------
  document.getElementById("addShowBtn").onclick = addShow;
  document.getElementById("addLineBtn").onclick = addLine;
  document.getElementById("practiceBtn").onclick = startPractice;
  document.getElementById("exitPracticeBtn").onclick = exitPractice;

  // ---------- Init ----------
  render();

});
