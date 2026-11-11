// Trampas en "Cabe destacar": en el examen el profe sustituye UNA afirmación
// por otra claramente falsa. Entonces la respuesta ya no es "Todas son correctas"
// sino la afirmación falsa.
(function () {
  const FALSE = {
    "Era Antigua": [
      "Los ganadores recibían una medalla de oro y un coche de caballos de regalo.",
      "Las mujeres casadas podían competir y eran las favoritas del público."
    ],
    "Atenas 1896": [
      "Participaron más de 200 países y el deporte estrella fue el baloncesto.",
      "Las mujeres ganaron la mayoría de las medallas de oro."
    ],
    "París 1900": [
      "Los vencedores recibían un coche como premio.",
      "España no envió a ningún deportista porque no existía el pasaporte."
    ],
    "San Luis 1904": [
      "Participaron más de 10.000 atletas de 150 países.",
      "Se celebraron en invierno y todas las pruebas fueron sobre hielo."
    ],
    "Londres 1908": [
      "Se celebraron por primera vez dentro de un estadio cubierto con aire acondicionado.",
      "El maratón se corrió en bicicleta por falta de corredores."
    ],
    "París 1924": [
      "España ganó 50 medallas de oro y quedó primera del medallero.",
      "Fueron los primeros Juegos en celebrarse fuera de Europa."
    ],
    "Ámsterdam 1928": [
      "La llama olímpica se encendió con un mechero desde la Luna.",
      "Alemania organizó los Juegos en su propio país ese año."
    ],
    "Los Ángeles 1932": [
      "Las competiciones duraron 2 años seguidos sin descanso.",
      "Participaron más países que nunca gracias a la bonanza económica."
    ],
    "Londres 1948": [
      "Fueron conocidos como «Los Juegos del Lujo» porque sobraba el dinero tras la guerra.",
      "La estrella fue un robot que ganó los 100 metros."
    ],
    "Helsinki 1952": [
      "El pebetero lo encendió Usain Bolt.",
      "Se celebraron en la playa porque no había estadio."
    ],
    "Melbourne 1956": [
      "Fueron los primeros Juegos celebrados en Europa.",
      "Australia no participó en sus propios Juegos."
    ],
    "Roma 1960": [
      "Se celebraron en la Antártida para evitar el calor del verano romano.",
      "Abebe Bikila ganó la maratón en moto."
    ],
    "Tokio 1964": [
      "España ganó 30 medallas de oro.",
      "El judo fue eliminado porque en Japón nadie lo practicaba."
    ],
    "México 1968": [
      "Bob Beamon saltó 3 metros en longitud y fue récord del mundo.",
      "Dick Fosbury ganó el salto de altura saltando de cabeza a una piscina."
    ],
    "Múnich 1972": [
      "Se suprimió la mascota para siempre.",
      "Se eliminó el atletismo del programa olímpico."
    ],
    "Montreal 1976": [
      "Nadia Comaneci tenía 45 años cuando obtuvo el 10.",
      "Fueron los Juegos más baratos de la historia y sobró dinero."
    ],
    "Moscú 1980": [
      "Estados Unidos fue el país con más deportistas en Moscú.",
      "Se celebraron en verano en la playa de Moscú."
    ],
    "Los Ángeles 1984": [
      "Más de 50 ciudades se presentaron para organizar estos Juegos.",
      "Fueron los Juegos que más dinero perdieron de la historia."
    ],
    "Seúl 1988": [
      "Ben Johnson fue declarado el deportista más limpio de los Juegos.",
      "La mascota Hodori era un pingüino."
    ],
    "Atlanta 1996": [
      "Se celebraron en Atenas para conmemorar el centenario.",
      "Fueron los Juegos con mejor transporte y ninguna crítica."
    ],
    "Atenas 2004": [
      "Todos los atletas desfilaron vestidos de astronauta.",
      "La maratón se corrió dentro de una piscina olímpica."
    ],
    "Pekín 2008": [
      "Usain Bolt ganó la medalla de oro en natación.",
      "Michael Phelps no ganó ninguna medalla."
    ],
    "Londres 2012": [
      "Londres es la única ciudad que nunca ha organizado unos Juegos.",
      "Michael Phelps se retiró antes de los Juegos sin ganar ninguna medalla."
    ],
    "Río 2016": [
      "Río de Janeiro terminó las obras con un año de antelación y le sobró dinero.",
      "Se celebraron en Argentina por problemas de espacio."
    ],
    "París 2024": [
      "Carlos Alcaraz ganó el oro en natación sincronizada.",
      "España no consiguió ninguna medalla."
    ],
    "Juegos Paralímpicos": [
      "Los Juegos Paralímpicos se celebran cada 20 años en la Luna.",
      "Solo pueden participar deportistas sin ninguna discapacidad."
    ]
  };
  const GENERIC = [
    "Estos Juegos se celebraron en Marte.",
    "España ganó todas las medallas de oro de estos Juegos."
  ];

  const pick = a => a[Math.floor(Math.random() * a.length)];
  const isTodas = t => /todas (son )?correctas/i.test(t);

  function makeTrap(q, p) {
    if (!q.tags || !q.tags.includes("cabe")) return q;
    const todas = Object.keys(q.options).find(k => isTodas(q.options[k]));
    if (!todas || q.answer !== todas) return q;
    if (Math.random() >= p) return q;
    const L = pick(Object.keys(q.options).filter(k => k !== todas));
    const fake = pick(FALSE[q.section] || GENERIC);
    return Object.assign({}, q, {
      options: Object.assign({}, q.options, { [L]: fake }),
      answer: L,
      trap: { letter: L, fake, original: q.options[L] }
    });
  }

  window.CABE = { makeTrap, isTodas, FALSE };
})();
