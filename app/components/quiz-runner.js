import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later, cancel } from '@ember/runloop';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default class QuizRunnerComponent extends Component {
  @service('question-bank') qb;

  @tracked current = null;     // aktuell angezeigte Frage (peek)
  @tracked isLocked = false;   // Auswahl gelockt (Feedback-Phase)
  @tracked selectedId = null;  // gewählte Antwort-ID
  @tracked uiAnswers = [];     // gemischte Antworten fürs UI
  @tracked showFact = false;   // Modal sichtbar

  // Progress-Werte als tracked Felder (damit HBS live updatet)
  @tracked total = 0;
  @tracked currentNumber = 0;

  _timerRef = null;

  get category() {
    return this.args.category;
  }

  // Prozent für die Progress-Bar (0..100)
  get progressPercent() {
    if (!this.total) return 0;
    return Math.round((this.currentNumber / this.total) * 100);
  }

  constructor() {
    super(...arguments);
    this._syncAll(); // initial: aktuelle Frage + Progress laden
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this._timerRef) cancel(this._timerRef);
  }

  // --- Sync-Helfer --------------------------------------------------------

  _syncProgress = () => {
    this.total = this.qb.total(this.category);
    this.currentNumber = this.qb.currentIndex(this.category);
  };

  _syncCurrent = () => {
    const q = this.qb.currentQuestion(this.category); // nur ansehen, nicht verbrauchen
    this.current = q;
    this.uiAnswers = q ? shuffle(q.answers) : [];
    this.selectedId = null;
    this.isLocked = false;
    this.showFact = false;
  };

  _syncAll = () => {
    this._syncCurrent();
    this._syncProgress();
  };

  // --- Interaktion --------------------------------------------------------

  @action
  choose(answerId) {
    if (this.isLocked || !this.current) return;
    this.selectedId = answerId;
    this.isLocked = true;

    if (this._timerRef) cancel(this._timerRef);
    this._timerRef = later(this, () => {
      this.showFact = true;
    }, 600);
  }

  // Feedback-Klassen: nur nach Lock zeigen
  shouldShowCorrect = (id) => {
    return this.isLocked && this.current && id === this.current.correct;
  };

  shouldShowWrong = (id) => {
    return this.isLocked && this.selectedId === id && this.current && id !== this.current.correct;
  };

  // Modal-Button „Nächste Frage“: Frage verbrauchen + alles neu syncen
  @action
  handleCloseFact() {
    this.showFact = false;
    this.qb.commit(this.category); // Fortschritt ++, ID aus Queue entfernen
    this._syncAll();               // neue Frage + aktualisierten Zähler holen
  }
}