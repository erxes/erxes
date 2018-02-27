/* eslint-env jest */

import { fieldQueries, fieldsGroupQueries } from '../data/resolvers/queries/fields';

describe('fieldQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(3);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(fieldQueries.fields);
    expectError(fieldQueries.fieldsCombinedByContentType);
    expectError(fieldQueries.fieldsDefaultColumnsConfig);
  });
});

describe('fieldsGroupQueries', () => {
  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(1);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(fieldsGroupQueries.fieldsGroups);
  });
});
