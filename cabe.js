// Versiones "trampa" de las preguntas "Cabe destacar": cambia un dato
// (número, año, nombre, primera/última...) en una afirmación.
// Si se altera, la respuesta correcta pasa a ser la afirmación alterada.
(function () {
  const SWAPS = {
    "primera": "última", "última": "primera", "primer": "último", "último": "primer",
    "primeros": "últimos", "primeras": "últimas", "oro": "plata", "plata": "bronce",
    "bronce": "plata", "mujeres": "hombres", "hombres": "mujeres", "mayor": "menor",
    "menor": "mayor", "más": "menos", "invierno": "verano", "verano": "invierno",
    "estadounidense": "británico", "francés": "italiano", "francesa": "italiana",
    "italiano": "francés", "japonés": "chino", "chino": "japonés", "rumana": "rusa",
    "húngara": "polaca", "holandesa": "belga", "jamaicano": "cubano",
    "brasileño": "argentino", "coreano": "chino", "danés": "sueco", "turco": "griego",
    "Grecia": "Italia", "Italia": "Grecia", "Francia": "Bélgica", "Alemania": "Austria",
    "Australia": "Canadá", "España": "Portugal", "Tokio": "Pekín", "Berlín": "Múnich",
    "atletismo": "natación", "natación": "atletismo", "gimnasia": "esgrima",
    "judo": "kárate", "tenis": "bádminton", "vela": "remo", "piragüismo": "remo",
    "boxeo": "lucha", "hockey": "rugby", "Phelps": "Spitz", "Bolt": "Lewis",
    "Coubertin": "Samaranch", "Coubertain": "Samaranch", "ninguna": "una",
    "Londres": "París", "Roma": "Atenas", "marcha": "maratón", "maratón": "marcha",
    "Zika": "Ébola", "Sena": "Támesis", "cemento": "madera", "mármol": "granito"
  };

  const pick = a => a[Math.floor(Math.random() * a.length)];

  function newNumber(tok) {
    if (/^\d{1,3}(\.\d{3})+$/.test(tok)) {
      const n = parseInt(tok.replace(/\./g, ""), 10);
      const m = n + pick([-1, 1]) * Math.max(1000, Math.round(n * 0.3 / 1000) * 1000);
      return String(m).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    if (/[.,]/.test(tok)) {
      const sep = tok.includes(",") ? "," : ".";
      const [i, d] = tok.split(sep);
      const nd = (parseInt(d, 10) + pick([2, 3, 5])) % Math.pow(10, d.length);
      return i + sep + String(nd).padStart(d.length, "0");
    }
    const n = parseInt(tok, 10);
    if (n >= 1800 && n <= 2030) return String(n + (n > 2016 ? -4 : pick([-8, -4, 4, 8])));
    if (n === 0) return "2";
    if (n <= 3) return String(n + pick([1, 2]));
    if (n <= 12) return String(n + pick([-2, -1, 1, 2]));
    return String(n + pick([-1, 1]) * Math.max(2, Math.round(n * pick([0.2, 0.3, 0.5]))));
  }

  // Devuelve {text, from, to} o null
  function mutate(text) {
    const cands = [];
    const numRe = /\d{1,3}(?:\.\d{3})+|\d+(?:[.,]\d+)?/g;
    let m;
    while ((m = numRe.exec(text))) {
      if (/^4$|^100$|^200$/.test(m[0]) && /x\s*$/i.test(text.slice(0, m.index))) continue;
      cands.push({ i: m.index, len: m[0].length, from: m[0], to: newNumber(m[0]) });
    }
    const wordRe = /[\p{L}]+/gu;
    while ((m = wordRe.exec(text))) {
      if (SWAPS[m[0]]) cands.push({ i: m.index, len: m[0].length, from: m[0], to: SWAPS[m[0]] });
    }
    const valid = cands.filter(c => c.to && c.to !== c.from);
    if (!valid.length) return null;
    // priorizar números (más "de examen") 2:1
    const nums = valid.filter(c => /\d/.test(c.from));
    const c = nums.length && Math.random() < 0.67 ? pick(nums) : pick(valid);
    return { text: text.slice(0, c.i) + c.to + text.slice(c.i + c.len), from: c.from, to: c.to };
  }

  function isTodas(t) { return /todas (son )?correctas/i.test(t); }

  // Crea una copia de la pregunta, posiblemente con trampa (prob p)
  function makeTrap(q, p) {
    if (!q.tags || !q.tags.includes("cabe")) return q;
    const todas = Object.keys(q.options).find(k => isTodas(q.options[k]));
    if (!todas || q.answer !== todas) return q;
    if (Math.random() >= p) return Object.assign({}, q, { trap: null });
    const letters = Object.keys(q.options).filter(k => k !== todas);
    for (const L of letters.sort(() => Math.random() - 0.5)) {
      const r = mutate(q.options[L]);
      if (r) {
        const options = Object.assign({}, q.options, { [L]: r.text });
        return Object.assign({}, q, {
          options, answer: L,
          trap: { letter: L, from: r.from, to: r.to, original: q.options[L] }
        });
      }
    }
    return q;
  }

  window.CABE = { mutate, makeTrap, isTodas };
})();
