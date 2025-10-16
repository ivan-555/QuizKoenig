import { module, test } from 'qunit';
import { setupRenderingTest } from 'quizz-koenig/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | quiz-runner', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<QuizRunner />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <QuizRunner>
        template block text
      </QuizRunner>
    `);

    assert.dom().hasText('template block text');
  });
});
