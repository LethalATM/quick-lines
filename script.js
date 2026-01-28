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

  function splitLineIntoChunks(text) {
    return text
      .split(/[,.;!?]/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  // ---------- Render ----------
  function render() {
    const tabs = document.getElementById("showTabs");
    const editor = document.getElementById("editor");
    const linesDiv = document.getElementById("lines");
    const title = document.getElementById("currentShowTitle");
    const charSelect = document.getElementById("practiceCharacter");

    // Show tabs
    tabs.innerHTML = "";
    shows.forEach((show, index) => {
      const tab = document.createElement("div");
      tab.className = "tab-wrapper";

      const btn = document.createElement("button");
      btn.textContent = show.name;
      btn.onclick = () => {
        currentShow = index;
        render();
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "×";
      deleteBtn.className = "delete-btn";
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Delete show "${show.name}"?`)) {
          shows.splice(index, 1);
          if (currentShow === index) currentShow = null;
          save();
          render();
        }
      };

      tab.appendChild(btn);
      tab.appendChild(deleteBtn);
      tabs.appendChild(tab);
    });

    if (currentShow === null) {
      editor.style.display = "none";
      return;
    }

    const show = shows[currentShow];
    editor.style.display = "block";
    title.textContent = show.name;

    // Render lines with delete buttons
    linesDiv.innerHTML = "";
    show.lines.forEach((line, lineIndex) => {
      const lineDiv = document.createElement("div");
      lineDiv.className = "line-item";

      const text = document.createElement("span");
      text.textContent = line.character + ": " + line.text;
      lineDiv.appendChild(text);

      const deleteLineBtn = document.createElement("button");
      deleteLineBtn.textContent = "Delete";
      deleteLineBtn.className = "delete-btn";
      deleteLineBtn.onclick = () => {
        if (confirm(`Delete line for "${line.character}"?`)) {
          shows[currentShow].lines.splice(lineIndex, 1);
          save();
          render();
        }
      };

      lineDiv.appendChild(deleteLineBtn);
      linesDiv.appendChild(lineDiv);
    });

    // Practice dropdown
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
    if (!input.value.trim()) return;
    shows.push({ name: input.value.trim(), lines: [] });
    input.value = "";
    save();
    render();
  }

  function addLine(chunks = null) {
    if (currentShow === null) return;
    const character = document.getElementById("characterInput").value.trim();
    const text = document.getElementById("lineInput").value.trim();
    if (!character || !text) return;

    shows[currentShow].lines.push({ character, text, chunks });

    document.getElementById("characterInput").value = "";
    document.getElementById("lineInput").value = "";

    save();
    render();
  }

  function splitAndAddLine() {
    const text = document.getElementById("lineInput").value.trim();
    if (!text) return;
    const chunks = splitLineIntoChunks(text);
    addLine(chunks);
  }

  // ---------- Practice Mode ----------
  function startPractice() {
    const myCharacter = document.getElementById("practiceCharacter").value;
    const overlay = document.getElementById("practiceOverlay");
    const area = document.getElementById("practiceArea");
    const show = shows[currentShow];

    document.body.style.overflow = "hidden";
    overlay.classList.remove("hidden");
    area.innerHTML = "";

    show.lines.forEach(line => {
      const div = document.createElement("div");

      if (line.character === myCharacter) {
        div.className = "my-line";

        if (line.chunks && line.chunks.length) {
          let index = 0;
          div.textContent = "⬛⬛⬛ YOUR LINE ⬛⬛⬛";
          div.onclick = () => {
            if (index < line.chunks.length) {
              div.textContent = line.chunks[index];
              index++;
            }
          };
        } else {
          div.textContent = "⬛⬛⬛ YOUR LINE ⬛⬛⬛";
          div.onclick = () => {
            div.textContent = line.character + ": " + line.text;
          };
        }

      } else {
        div.textContent = line.character + ": " + line.text;
        div.className = "cue-line";
      }

      area.appendChild(div);
    });
  }

  function exitPractice() {
    document.body.style.overflow = "auto";
    document.getElementById("practiceOverlay").classList.add("hidden");
  }

  // ---------- Event Wiring ----------
  document.getElementById("addShowBtn").onclick = addShow;
  document.getElementById("addLineBtn").onclick = addLine;
  document.getElementById("splitLineBtn").onclick = splitAndAddLine;
  document.getElementById("practiceBtn").onclick = startPractice;
  document.getElementById("exitPracticeBtn").onclick = exitPractice;

  // ---------- Init ----------
  render();

});
