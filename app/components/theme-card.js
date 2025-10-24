import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { slugToCategory } from '../utils/category-map';

export default class ThemeCardComponent extends Component {
  @service('question-bank') qb;

  get categoryLabel() {
    return slugToCategory(this.args.slug) ?? this.args.theme ?? '';
  }

  get total() {
    return this.qb.total(this.categoryLabel);
  }

  get currentNumber() {
    return this.qb.currentIndex(this.categoryLabel);
  }

  get hasQuestions() {
    return this.total > 0;
  }
}