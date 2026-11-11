// Preguntas generadas a partir de la "Relación de abanderados españoles" (pág. 57 del PDF).
// Cada edición es una pregunta; los distractores son otros abanderados de la propia lista.
const ABANDERADOS = [
  ["Amberes 1920", "Ignacio Izaguirre (atletismo) y Mariano Arriate (fútbol)"],
  ["París 1924", "Félix Mendizábal (atletismo)"],
  ["Ámsterdam 1928", "Diego Ordóñez (atletismo)"],
  ["Los Ángeles 1932", "Julio Castro (tiro al blanco)"],
  ["Berlín 1936", "España no participó (boicot)"],
  ["1940 y 1944", "No se celebraron (2ª Guerra Mundial)"],
  ["Londres 1948", "Fabián Vicente del Valle (boxeo)"],
  ["Helsinki 1952", "Luis Omedes (remo)"],
  ["Melbourne 1956", "España no participó"],
  ["Roma 1960", "Jaime Belenguer (gimnasia)"],
  ["Tokio 1964", "Eduardo Dualde (hockey)"],
  ["México 1968", "Gonzalo Fernández de Córdoba (vela)"],
  ["Múnich 1972", "Francisco Fernández Ochoa (esquí)"],
  ["Montreal 1976", "Enrique Rodríguez Cal (boxeo)"],
  ["Moscú 1980", "Herminio Menéndez (piragüismo)"],
  ["Los Ángeles 1984", "Alejandro Abascal (vela)"],
  ["Seúl 1988", "Cristina de Borbón (vela)"],
  ["Barcelona 1992", "Felipe de Borbón (vela)"],
  ["Atlanta 1996", "Luis Doreste (vela)"],
  ["Sydney 2000", "Manuel Estiarte (waterpolo)"],
  ["Atenas 2004", "Isabel Fernández (judo)"],
  ["Pekín 2008", "David Cal (piragüismo)"],
  ["Londres 2012", "Pau Gasol (baloncesto)"],
  ["Río de Janeiro 2016", "Rafael Nadal (tenis)"],
  ["Tokio 2020/2021", "Mireia Belmonte (natación) y Saúl Craviotto (piragüismo)"],
  ["París 2024", "Marcos Cooper (piragüista) y Tamara Echegoyen (regatista)"]
];

(function () {
  const names = ABANDERADOS
    .map(e => e[1])
    .filter(a => !/no particip|Guerra/i.test(a));
  const letters = ["a", "b", "c", "d"];
  ABANDERADOS.forEach(([ed, ans], i) => {
    // 3 distractores: otros abanderados, espaciados para variar
    const distract = names.filter(n => n !== ans);
    const picked = [
      distract[(i * 3 + 1) % distract.length],
      distract[(i * 3 + 9) % distract.length],
      distract[(i * 3 + 17) % distract.length]
    ];
    const opts = [...picked, ans];
    // posición de la correcta rotando a-d
    const ansPos = i % 4;
    opts.splice(ansPos, 0, opts.splice(3, 1)[0]);
    const options = {};
    letters.forEach((l, k) => options[l] = opts[k]);
    QUESTIONS.push({
      id: QUESTIONS.length,
      q: `¿Quién fue el abanderado español en los Juegos de ${ed}?`,
      options,
      answer: letters[ansPos],
      section: "Abanderados (lista completa)",
      page: 57,
      tags: ["abanderado"]
    });
  });
})();
