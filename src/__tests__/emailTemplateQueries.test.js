/* eslint-env jest */

import emailTemplateQueries from '../data/resolvers/queries/emailTemplates';

describe('emailTemplateQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(2);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(emailTemplateQueries.emailTemplates);
    expectError(emailTemplateQueries.emailTemplatesTotalCount);
  });
});
