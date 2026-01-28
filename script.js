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
    // Split on natural pauses: comma, semicolon, period, !, ?
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

    if (currentShow === null) {
      editor.style.display = "none";
      return;
    }

    const show = shows[currentShow];
    editor.style.display = "block";
    title.textContent = show.name;

    // Render lines
    linesDiv.innerHTML = "";
    show.lines.forEach(line => {
      const div = document.createElement("div");
      div.textContent = line.character + ": " + line.text;
      linesDiv.appendChild(div);
    });

    // Populate practice character dropdown
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

    shows[currentShow].lines.push({
      character,
      text,
      chunks
    });

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
