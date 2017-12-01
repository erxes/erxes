/* eslint-env jest */

import formQueries from '../data/resolvers/queries/forms';

describe('formQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(3);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(formQueries.forms);
    expectError(formQueries.formDetail);
    expectError(formQueries.formsTotalCount);
  });
});
