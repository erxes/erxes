/* eslint-env jest */

import responseTemplateQueries from '../data/resolvers/queries/responseTemplates';

describe('responseTemplateQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(2);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(responseTemplateQueries.responseTemplates);
    expectError(responseTemplateQueries.responseTemplatesTotalCount);
  });
});
