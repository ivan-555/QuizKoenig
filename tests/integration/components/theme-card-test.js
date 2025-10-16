import { module, test } from 'qunit';
import { setupRenderingTest } from 'quizz-koenig/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | theme-card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<ThemeCard />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <ThemeCard>
        template block text
      </ThemeCard>
    `);

    assert.dom().hasText('template block text');
  });
});
