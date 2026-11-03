/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'jotai';
import { useState } from 'react';
import { RecordPagePortal, RecordPageSlot } from '../RecordPageSlot';

let mockExpanded = false;
jest.mock('erxes-ui', () => ({
  ...jest.requireActual(
    '../../../../../../libs/erxes-ui/src/modules/layout/states/appLayoutPageState',
  ),
  useQueryState: () => [mockExpanded],
}));
jest.mock('ui-modules', () => ({
  useSidePanel: () => ({
    open: true,
    record: { contentType: 'core:customer', contentId: 'contact-a' },
  }),
}));

it('keeps navigation and the same editor when opening the full record page and returning to compact', () => {
  const Host = () => {
    const [expanded, setExpanded] = useState(false);
    mockExpanded = expanded;
    return (
      <>
        <nav>Contacts menu</nav>
        <button onClick={() => setExpanded(!expanded)}>Toggle full page</button>
        <section aria-label="App page">
          <RecordPageSlot>
            <p>Customers list</p>
          </RecordPageSlot>
        </section>
        <RecordPagePortal active={expanded}>
          <input aria-label="Record draft" defaultValue="Draft" />
        </RecordPagePortal>
      </>
    );
  };
  render(
    <Provider>
      <Host />
    </Provider>,
  );
  const draft = screen.getByRole<HTMLInputElement>('textbox');
  fireEvent.change(draft, { target: { value: 'Unsaved change' } });
  expect(screen.getByRole('region', { name: 'App page' }).contains(draft)).toBe(
    false,
  );
  draft.focus();
  fireEvent.click(screen.getByRole('button', { name: 'Toggle full page' }));
  expect(screen.getByRole('navigation').textContent).toBe('Contacts menu');
  expect(screen.getByRole('region', { name: 'App page' }).contains(draft)).toBe(
    true,
  );
  expect(screen.getByRole('textbox')).toBe(draft);
  expect(document.activeElement).toBe(draft);
  expect(screen.getByText('Customers list').closest('[hidden]')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Toggle full page' }));
  expect(screen.getByRole('textbox')).toBe(draft);
  expect(draft.value).toBe('Unsaved change');
  expect(screen.getByRole('region', { name: 'App page' }).contains(draft)).toBe(
    false,
  );
  expect(screen.getByText('Customers list').closest('[hidden]')).toBeNull();
});

it('retains the plugin sidebar when its record replaces the plugin page body', () => {
  const { AppLayoutPageSlot } = jest.requireActual<
    typeof import('../../../../../../libs/erxes-ui/src/modules/layout/components/AppLayoutPageSlot')
  >(
    '../../../../../../libs/erxes-ui/src/modules/layout/components/AppLayoutPageSlot',
  );
  mockExpanded = true;
  render(
    <Provider>
      <RecordPageSlot>
        <nav>Operation menu</nav>
        <AppLayoutPageSlot>
          <p>Tasks list</p>
        </AppLayoutPageSlot>
      </RecordPageSlot>
      <RecordPagePortal active>
        <input aria-label="Full contact" />
      </RecordPagePortal>
    </Provider>,
  );
  expect(screen.getByText('Operation menu').closest('[hidden]')).toBeNull();
  expect(screen.getByText('Tasks list').closest('[hidden]')).toBeTruthy();
  expect(
    screen.getByRole('textbox', { name: 'Full contact' }).closest('[hidden]'),
  ).toBeNull();
});
