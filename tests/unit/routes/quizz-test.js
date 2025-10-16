import { module, test } from 'qunit';
import { setupTest } from 'quizz-koenig/tests/helpers';

module('Unit | Route | quizz', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:quizz');
    assert.ok(route);
  });
});
