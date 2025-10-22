// app/services/question-bank.js
import Service from '@ember/service';
import QUESTIONS from '../data/questions';

const STORAGE_QUEUES = 'quiz.queue.v1';
const STORAGE_POS    = 'quiz.pos.v1';

// ---------- Helpers -----------------------------------------------------------

// Fisher-Yates
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Robuste Normalisierung für Kategorien: slug-ähnlicher Key
// - Unicode-Normalisierung
// - kleinschreibung
// - & -> Leerzeichen (damit "Essen & Trinken" == "essen trinken")
// - alles Nicht-Alphanumerische -> Leerzeichen
// - Whitespace kollabieren
function catKey(str) {
  return String(str ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9äöüß]+/g, ' ')  // erlaube einfache dt. Buchstaben
    .trim()
    .replace(/\s+/g, '-');            // mache daraus einen slug-ähnlichen key
}

// -----------------------------------------------------------------------------

export default class QuestionBankService extends Service {
  _queues = Object.create(null);    // { [catKey]: string[] }
  _positions = Object.create(null); // { [catKey]: number }

  constructor() {
    super(...arguments);
    try {
      const q = localStorage.getItem(STORAGE_QUEUES);
      if (q) this._queues = JSON.parse(q) || Object.create(null);
      const p = localStorage.getItem(STORAGE_POS);
      if (p) this._positions = JSON.parse(p) || Object.create(null);
    } catch (_) {}
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_QUEUES, JSON.stringify(this._queues));
      localStorage.setItem(STORAGE_POS, JSON.stringify(this._positions));
    } catch (_) {}
  }

  // ---------- Fragenpool-Utilities ------------------------------------------

  all() { return QUESTIONS; }

  categories() {
    return [...new Set(QUESTIONS.map(q => q.category))].sort((a,b) =>
      a.localeCompare(b, 'de', { sensitivity: 'base' })
    );
  }

  byCategory(categoryLabel) {
    const key = catKey(categoryLabel);
    return QUESTIONS.filter(q => catKey(q.category) === key);
  }

  byGeneralKnowledge(flag = true) {
    return QUESTIONS.filter(q => q.general_knowledge === flag);
  }

  // IDs für Kategorie (Allgemeinwissen via Flag)
  _idsFor(categoryLabel) {
    if (catKey(categoryLabel) === catKey('Allgemeinwissen')) {
      return this.byGeneralKnowledge(true).map(q => q.id);
    }
    return this.byCategory(categoryLabel).map(q => q.id);
  }

  // ---------- Queue / Progress ----------------------------------------------

  _ensureQueue(categoryLabel) {
    const key = catKey(categoryLabel);
    const needsFill = !this._queues[key] || this._queues[key].length === 0;
    if (needsFill) {
      const ids = this._idsFor(categoryLabel);
      this._queues[key] = shuffle(ids);
      this._positions[key] = 0;
      this._save();
    }
  }

  currentId(categoryLabel) {
    const key = catKey(categoryLabel);
    this._ensureQueue(categoryLabel);
    const arr = this._queues[key];
    return arr && arr.length ? arr[arr.length - 1] : null; // peek
  }

  currentQuestion(categoryLabel) {
    const id = this.currentId(categoryLabel);
    return id ? (QUESTIONS.find(q => q.id === id) || null) : null;
  }

  commit(categoryLabel) {
    const key = catKey(categoryLabel);
    this._ensureQueue(categoryLabel);
    this._queues[key].pop(); // consume one
    this._positions[key] = (this._positions[key] ?? 0) + 1;
    this._save();
  }

  reset(categoryLabel) {
    const key = catKey(categoryLabel);
    delete this._queues[key];
    delete this._positions[key];
    this._save();
  }

  total(categoryLabel) {
    return this._idsFor(categoryLabel).length;
  }

  remaining(categoryLabel) {
    const key = catKey(categoryLabel);
    this._ensureQueue(categoryLabel);
    return this._queues[key]?.length ?? this.total(categoryLabel);
  }

  currentIndex(categoryLabel) {
    const key = catKey(categoryLabel);
    const answered = this._positions[key] ?? 0;
    const total = this.total(categoryLabel);
    if (total === 0) return 0;
    return Math.min(answered + 1, total);
  }
}