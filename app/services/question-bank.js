import Service from '@ember/service';
import QUESTIONS from '../data/questions';

const STORAGE_QUEUES = 'quiz.queue.v1';
const STORAGE_POS    = 'quiz.pos.v1';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default class QuestionBankService extends Service {
  // Verbleibende IDs je Kategorie (Stack/Array)
  _queues = Object.create(null);      // { [categoryLabel]: string[] }
  // Anzahl beantworteter Fragen in der aktuellen Runde je Kategorie
  _positions = Object.create(null);   // { [categoryLabel]: number }

  constructor() {
    super(...arguments);
    try {
      const q = localStorage.getItem(STORAGE_QUEUES);
      if (q) this._queues = JSON.parse(q) || Object.create(null);
      const p = localStorage.getItem(STORAGE_POS);
      if (p) this._positions = JSON.parse(p) || Object.create(null);
    } catch (_) {
      // ignore storage errors
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_QUEUES, JSON.stringify(this._queues));
      localStorage.setItem(STORAGE_POS, JSON.stringify(this._positions));
    } catch (_) {
      // ignore storage errors
    }
  }

  // ---------- Fragenpool-Utilities ----------
  all() { return QUESTIONS; }
  categories() { return [...new Set(QUESTIONS.map(q => q.category))].sort(); }
  byCategory(category) { return QUESTIONS.filter(q => q.category === category); }
  byGeneralKnowledge(flag = true) { return QUESTIONS.filter(q => q.general_knowledge === flag); }

  // IDs für eine Kategorie-Überschrift (Allgemeinwissen kommt aus dem Flag)
  _idsFor(categoryLabel) {
    if (categoryLabel === 'Allgemeinwissen') {
      return this.byGeneralKnowledge(true).map(q => q.id);
    }
    return this.byCategory(categoryLabel).map(q => q.id);
  }

  // Queue sicherstellen (bei Start und nach Rundenende)
  _ensureQueue(category) {
    const needsFill = !this._queues[category] || this._queues[category].length === 0;
    if (needsFill) {
      const ids = this._idsFor(category);
      this._queues[category] = shuffle(ids);
      // Neue Runde: bisher beantwortet = 0
      this._positions[category] = 0;
      this._save();
    }
  }

  // ----- Aktuelle Frage NUR ANZEIGEN (nicht verbrauchen)
  currentId(category) {
    this._ensureQueue(category);
    const arr = this._queues[category];
    return arr && arr.length ? arr[arr.length - 1] : null; // Spitze (peek)
  }

  currentQuestion(category) {
    const id = this.currentId(category);
    return id ? (QUESTIONS.find(q => q.id === id) || null) : null;
  }

  // ----- Tatsächlich fortschreiten (nach "Nächste Frage")
  commit(category) {
    this._ensureQueue(category);
    // eine ID „verbrauchen“
    this._queues[category].pop();
    // beantwortete +1 → Anzeige springt auf nächste
    this._positions[category] = (this._positions[category] ?? 0) + 1;
    this._save();
  }

  // Manuell zurücksetzen
  reset(category) {
    delete this._queues[category];
    delete this._positions[category];
    this._save();
  }

  // ---------- Progress-APIs ----------
  total(category) {
    return this._idsFor(category).length;
  }

  remaining(category) {
    this._ensureQueue(category);
    return this._queues[category]?.length ?? this.total(category);
  }

  // 1-basiert: Nummer der aktuell angezeigten Frage
  currentIndex(category) {
    const answered = this._positions[category] ?? 0;   // bereits bestätigte Fragen
    const total = this.total(category);
    // Vor der ersten commit: answered=0 → Anzeige = 1 (wenn total>0)
    if (total === 0) return 0;
    return Math.min(answered + 1, total);
  }
}