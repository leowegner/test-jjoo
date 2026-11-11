(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const LS = "jjoo_v2";
  const store = Object.assign({ answered: 0, correct: 0, fails: [] }, JSON.parse(localStorage.getItem(LS) || "{}"));
  const save = () => localStorage.setItem(LS, JSON.stringify(store));
  const fails = new Set(store.fails);

  const TRAP_P = 0.5;
  const EXAM_N = 40;

  const sections = [...new Set(QUESTIONS.map(q => q.section))];
  let active = new Set(sections);
  let mode = "test", quick = "all";
  let pool = [], idx = 0, hits = 0, wrong = [], answered = false;

  // ---------- setup ----------
  function poolFor() {
    return QUESTIONS.filter(q => {
      if (!active.has(q.section)) return false;
      if (quick === "aband") return (q.tags || []).includes("abanderado");
      if (quick === "cabe") return (q.tags || []).includes("cabe");
      if (quick === "fails") return fails.has(q.id);
      return true;
    });
  }

  function updateCount() {
    const n = poolFor().length;
    const m = mode === "exam" ? Math.min(EXAM_N, n) : n;
    $("startBtn").textContent = n ? `Empezar · ${m} preguntas` : "Sin preguntas";
    $("startBtn").disabled = !n;
    $("failsCount").textContent = fails.size;
  }

  function buildChips() {
    const box = $("chips"); box.innerHTML = "";
    sections.forEach(s => {
      const n = QUESTIONS.filter(q => q.section === s).length;
      const b = document.createElement("button");
      b.className = "chip" + (active.has(s) ? " on" : "");
      b.innerHTML = `${esc(s)}<i>${n}</i>`;
      b.onclick = () => { active.has(s) ? active.delete(s) : active.add(s); b.classList.toggle("on"); updateCount(); };
      box.appendChild(b);
    });
  }

  document.querySelectorAll(".mode").forEach(b => b.onclick = () => {
    mode = b.dataset.mode;
    document.querySelectorAll(".mode").forEach(x => x.classList.toggle("on", x === b));
    updateCount();
  });
  document.querySelectorAll(".qbtn").forEach(b => b.onclick = () => {
    quick = b.dataset.q;
    document.querySelectorAll(".qbtn").forEach(x => x.classList.toggle("on", x === b));
    updateCount();
  });
  $("allBtn").onclick = () => { active = new Set(sections); buildChips(); updateCount(); };
  $("noneBtn").onclick = () => { active = new Set(); buildChips(); updateCount(); };

  function showStats() {
    $("stats").textContent = store.answered
      ? `Histórico: ${store.correct}/${store.answered} aciertos (${Math.round(100 * store.correct / store.answered)}%)`
      : `${QUESTIONS.length} preguntas en total`;
  }

  // ---------- flow ----------
  function show(view) {
    ["setup", "quiz", "results"].forEach(v => $(v).classList.toggle("hidden", v !== view));
    $("setupBar").classList.toggle("hidden", view !== "setup");
    $("quizBar").classList.toggle("hidden", view !== "quiz");
    $("resBar").classList.toggle("hidden", view !== "results");
    $("score").classList.toggle("hidden", view !== "quiz");
    window.scrollTo(0, 0);
  }

  function start(list) {
    if (!list.length) return;
    const traps = $("trapToggle").checked && mode !== "review";
    let qs = list.slice();
    if ($("shuffleToggle").checked || mode === "exam") shuffle(qs);
    if (mode === "exam") qs = qs.slice(0, EXAM_N);
    pool = qs.map(q => traps ? CABE.makeTrap(q, TRAP_P) : q);
    idx = 0; hits = 0; wrong = [];
    show("quiz");
    render();
  }

  function render() {
    answered = false;
    const q = pool[idx];
    $("fill").style.width = `${100 * idx / pool.length}%`;
    $("progTxt").textContent = `${idx + 1}/${pool.length}`;
    $("score").textContent = mode === "test" ? `✓ ${hits}` : (mode === "exam" ? "Examen" : "Repaso");
    const isCabe = (q.tags || []).includes("cabe");
    $("meta").innerHTML =
      `<span class="tag">${esc(q.section)}</span>` +
      (isCabe ? `<span class="tag">Cabe destacar</span>` : "") +
      `<span class="tag g">pág. ${q.page}</span>`;
    $("qtext").textContent = q.q;
    const box = $("opts"); box.innerHTML = "";
    Object.keys(q.options).sort().forEach(L => {
      const b = document.createElement("button");
      b.className = "opt"; b.dataset.l = L;
      b.innerHTML = `<span class="L">${L})</span><span class="T">${esc(q.options[L])}</span>`;
      if (mode === "review") { b.disabled = true; if (L === q.answer) b.classList.add("ok"); }
      else b.onclick = () => answer(L);
      box.appendChild(b);
    });
    const fb = $("fb");
    if (mode === "review" && isCabe) {
      fb.className = "fb ok";
      fb.innerHTML = `Ojo: en el examen pueden cambiar un dato de alguna afirmación. Si alguna está mal, la correcta es <b>esa</b>, no «Todas son correctas».`;
    } else fb.className = "fb hidden";
    $("nextBtn").classList.toggle("hidden", mode !== "review");
    $("nextBtn").textContent = idx + 1 >= pool.length ? "Ver resultado" : "Siguiente →";
  }

  function explain(q) {
    if (q.trap) {
      const t = q.trap;
      return `<span class="ex">Dato cambiado en la <b>${t.letter})</b>: pone <mark>${esc(t.to)}</mark>, lo correcto es <b>${esc(t.from)}</b>.</span>`;
    }
    if ((q.tags || []).includes("cabe") && CABE.isTodas(q.options[q.answer] || ""))
      return `<span class="ex">Esta vez no había ningún dato cambiado.</span>`;
    return "";
  }

  function answer(L) {
    if (answered) return; answered = true;
    const q = pool[idx];
    const ok = L === q.answer;
    if (ok) hits++; else wrong.push({ q, chosen: L });
    store.answered++; if (ok) store.correct++;
    if (ok) fails.delete(q.id); else fails.add(q.id);
    store.fails = [...fails]; save();

    const btns = [...document.querySelectorAll(".opt")];
    btns.forEach(b => b.disabled = true);
    const chosen = btns.find(b => b.dataset.l === L);
    if (mode === "exam") {
      chosen.style.borderColor = "var(--acc)";
      $("nextBtn").classList.remove("hidden");
      $("nextBtn").textContent = idx + 1 >= pool.length ? "Ver resultado" : "Siguiente →";
      return;
    }
    btns.find(b => b.dataset.l === q.answer).classList.add("ok");
    if (!ok) chosen.classList.add("bad");
    if (q.trap) {
      const tb = btns.find(b => b.dataset.l === q.trap.letter).querySelector(".T");
      tb.innerHTML = esc(q.options[q.trap.letter]).replace(esc(q.trap.to), `<mark>${esc(q.trap.to)}</mark>`);
    }
    const fb = $("fb");
    fb.className = "fb " + (ok ? "ok" : "bad");
    fb.innerHTML = (ok ? "✓ ¡Correcto!" : `✗ Era la <b>${q.answer.toUpperCase()})</b>`) + explain(q);
    $("score").textContent = `✓ ${hits}`;
    $("nextBtn").classList.remove("hidden");
    $("nextBtn").textContent = idx + 1 >= pool.length ? "Ver resultado" : "Siguiente →";
    fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function next() {
    idx++;
    if (idx >= pool.length) return finish();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finish() {
    show("results");
    const n = pool.length, pct = n ? Math.round(100 * hits / n) : 0;
    if (mode === "review") {
      $("resEmoji").textContent = "📖"; $("resTitle").textContent = "Repaso terminado";
      $("pct").textContent = ""; $("resTxt").textContent = `Has repasado ${n} preguntas.`;
    } else {
      $("resEmoji").textContent = pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : pct >= 50 ? "💪" : "📚";
      $("resTitle").textContent = pct >= 50 ? (pct >= 70 ? "¡Muy bien!" : "Aprobado") : "A repasar";
      $("pct").textContent = pct + "%";
      $("resTxt").textContent = `${hits} de ${n} correctas`;
    }
    $("wrongList").innerHTML = wrong.map(({ q, chosen }) =>
      `<div>${esc(q.q)}<br><span style="color:#ff9a9d">Tu respuesta: ${chosen}) ${esc(q.options[chosen])}</span><br><b>Correcta: ${q.answer}) ${esc(q.options[q.answer])}</b>${explain(q)}</div>`
    ).join("");
    $("retryBtn").classList.toggle("hidden", !wrong.length);
    $("retryBtn").textContent = `Repetir falladas (${wrong.length})`;
    showStats(); updateCount();
  }

  $("startBtn").onclick = () => start(poolFor());
  $("nextBtn").onclick = next;
  $("quitBtn").onclick = () => { if (idx === 0 || confirm("¿Salir de la sesión?")) { show("setup"); showStats(); updateCount(); } };
  $("menuBtn").onclick = () => show("setup");
  $("retryBtn").onclick = () => start(wrong.map(w => QUESTIONS.find(q => q.id === w.q.id)));

  document.addEventListener("keydown", e => {
    if ($("quiz").classList.contains("hidden")) return;
    const q = pool[idx]; if (!q) return;
    if (!answered && mode !== "review") {
      const ls = Object.keys(q.options).sort();
      const L = /^[1-5]$/.test(e.key) ? ls[+e.key - 1] : e.key.toLowerCase();
      if (ls.includes(L)) answer(L);
    } else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); next(); }
  });

  $("total").textContent = QUESTIONS.length;
  buildChips(); showStats(); updateCount(); show("setup");
})();
