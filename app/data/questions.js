// 1) Deine Fragen OHNE id
export const RAW_QUESTIONS = [
  {
    category: "Geschichte",
    general_knowledge: true,
    question: "Wie nennt man eine antike römische Brücke, die Wasser leitete?",
    answers: [
      { id: "a", text: "Kolonnade" },
      { id: "b", text: "Aquädukt" },
      { id: "c", text: "Therme" },
      { id: "d", text: "Watergate" }
    ],
    correct: "b",
    fact:
      "Aquädukte waren Wasserleitungen der Römer, die ganze Städte mit Frischwasser versorgten ..."
  },
  {
    category: "Geschichte",
    general_knowledge: true,
    question: "Wie nennt man 2?",
    answers: [
      { id: "a", text: "Kolonnade" },
      { id: "b", text: "Aquädukt" },
      { id: "c", text: "Therme" },
      { id: "d", text: "Watergate" }
    ],
    correct: "b",
    fact:
      "Aquädukte waren Wasserleitungen der Römer, die ganze Städte mit Frischwasser versorgten ..."
  },
  {
    category: "Geschichte",
    general_knowledge: true,
    question: "Wie nennt man 3?",
    answers: [
      { id: "a", text: "Kolonnade" },
      { id: "b", text: "Aquädukt" },
      { id: "c", text: "Therme" },
      { id: "d", text: "Watergate" }
    ],
    correct: "b",
    fact:
      "Aquädukte waren Wasserleitungen der Römer, die ganze Städte mit Frischwasser versorgten ..."
  },

  // weitere Fragen …
];


// 2) Mini-Helfer: normalisieren (damit der Hash stabil bleibt)
function norm(str) {
  return String(str)
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " "); // Mehrfach-Whitespace → 1 Leerzeichen
}


// 3) Stabiler, schneller Sync-Hash (djb2)
//    Ergebnis als 8-stellige Hex-ID.
function hash8(input) {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  // in 32-bit umwandeln & als 8-stellige Hex darstellen
  return (h >>> 0).toString(16).padStart(8, "0");
}


// 4) ID aus stabilen Feldern bauen:
//    - category
//    - question
//    - Antworten-Texte *sortiert* (damit die Reihenfolge egal ist)
export function generateId(q) {
  const cat = norm(q.category);
  const ques = norm(q.question);
  const choices = (q.answers ?? [])
    .map(a => norm(a.text))
    .sort()
    .join("|");

  const base = `${cat}|${ques}|${choices}`;
  return `q_${hash8(base)}`; // z.B. "q_3fa9b1c2"
}


// 5) Fragen MIT id
const QUESTIONS = RAW_QUESTIONS.map(q => ({
  ...q,
  id: generateId(q),
}));

export default QUESTIONS;

// Nur Inhaltsänderungen (Frage/Antworten/Category) ergeben eine neue ID
