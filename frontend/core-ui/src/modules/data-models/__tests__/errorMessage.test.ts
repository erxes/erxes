import { dataModelErrorMessage } from '../errorMessage';

it('explains a duplicate relation in terms of the visible names users can change', () => {
  expect(
    dataModelErrorMessage(
      new Error(
        'A forward or reverse field name already exists, including archived fields',
      ),
    ),
  ).toBe(
    'A field with this name already exists on one of the objects. Choose another relation name, or change “Name on related object” under More settings.',
  );
});

it('only suggests reopening the editor for an actual edit conflict', () => {
  expect(
    dataModelErrorMessage('Field changed; reload it before saving'),
  ).toContain('Close this form and open it again');
  expect(dataModelErrorMessage('Permission denied')).toContain(
    'Ask a workspace administrator',
  );
  expect(dataModelErrorMessage('Permission denied')).not.toContain(
    'Close this form',
  );
});

it('explains archived destinations and connection failures without technical jargon', () => {
  expect(dataModelErrorMessage('The related model is archived')).toContain(
    'Restore it in Data Models',
  );
  expect(dataModelErrorMessage('Failed to fetch')).toContain(
    'Check your connection',
  );
});
