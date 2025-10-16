import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { slugToCategory } from '../utils/category-map';

export default class QuizRoute extends Route {
  @service('question-bank') qb;

  model({ slug }) {
    if (slug === 'allgemeinwissen') {
      return {
        slug,
        categoryLabel: 'Allgemeinwissen',
        questions: this.qb.byGeneralKnowledge(true),
      };
    }

    const category = slugToCategory(slug);
    return {
      slug,
      categoryLabel: category,
      questions: category ? this.qb.byCategory(category) : [],
    };
  }
}