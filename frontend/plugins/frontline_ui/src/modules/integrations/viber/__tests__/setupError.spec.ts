import { test } from 'node:test';
import { strictEqual } from 'node:assert';
import { getSavedViberIntegrationId } from '../setupError';

test('partial setup is identified by structured error data rather than display text', () => {
  strictEqual(
    getSavedViberIntegrationId({
      graphQLErrors: [
        {
          message: 'Translated message',
          extensions: {
            code: 'VIBER_SETUP_INCOMPLETE',
            integrationId: 'saved-inbox',
          },
        },
      ],
    }),
    'saved-inbox',
  );
  for (const error of [
    null,
    new Error('Integration saved. Use Repair'),
    { graphQLErrors: [{ extensions: { code: 'VIBER_SETUP_INCOMPLETE' } }] },
    {
      graphQLErrors: [
        { extensions: { code: 'FORBIDDEN', integrationId: 'inbox' } },
      ],
    },
    { graphQLErrors: [null, 'error'] },
  ]) {
    strictEqual(getSavedViberIntegrationId(error), undefined);
  }
});
