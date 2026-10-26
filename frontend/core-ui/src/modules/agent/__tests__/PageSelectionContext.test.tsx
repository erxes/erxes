/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { PageSelectionContext } from '../components/PageSelectionContext';
import {
  pageSelectionsPart,
  pageSelectionsDisplayText,
} from '../pageSelections';
import { mapStoredMessagesToUIMessages } from '../mapStoredMessages';
jest.mock('erxes-ui', () => ({
  readImage: (url: string) => `/read-file?key=${url}`,
}));
const selection = {
  id: '47b58525-fceb-48ee-9262-dcd040c63bb2',
  title: 'Төгсжаргалант мандал ХХК',
  path: '/contacts/companies',
  text: 'Company information',
  width: 240,
  height: 80,
  snapshot: { url: 'selection.png', type: 'image/png' as const, size: 68 },
};

it('renders selection meaning and preview without any file or download action', () => {
  render(<PageSelectionContext selection={selection} />);
  expect(
    screen.getByRole('group', {
      name: `Selected page element: ${selection.title}`,
    }),
  ).toBeTruthy();
  expect(screen.getByText('Page selection')).toBeTruthy();
  expect(screen.getByRole('img').getAttribute('src')).toBe(
    '/read-file?key=selection.png',
  );
  expect(screen.queryByRole('button')).toBeNull();
  expect(screen.queryByRole('link')).toBeNull();
  expect(screen.queryByText(/\.txt|\.png/)).toBeNull();
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByText(selection.title)).toBeTruthy();
  expect(screen.queryByRole('link')).toBeNull();
});
it('restores the question and typed context without showing model-only context text', () => {
  const part = pageSelectionsPart([selection]);
  const persisted = {
    ...part,
    data: { selections: [selection], displayText: 'Report on this company' },
  };
  const messages = mapStoredMessagesToUIMessages([
    {
      id: 'm1',
      role: 'user',
      content: {
        parts: [
          {
            type: 'text',
            text: 'Report on this company + model-only selection JSON',
          },
          persisted,
        ],
      },
    },
  ]);
  expect(messages[0].parts[0]).toEqual({
    type: 'text',
    text: 'Report on this company',
  });
  expect(messages[0].parts[1]).toEqual(persisted);
  expect(pageSelectionsDisplayText(messages[0].parts)).toBe(
    'Report on this company',
  );
});
