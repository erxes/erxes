/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { useContext, useState } from 'react';
import {
  IRecordViewProps,
  SidePanelDraftContext,
  sidePanelDraftState,
  sidePanelHistoryState,
  sidePanelSessionState,
} from 'ui-modules';
import { SidePanelRecordStack } from '../SidePanelRecordStack';

jest.mock('../CoreModulePanelSlot', () => ({
  CoreModulePanelSlot: () => null,
}));

jest.mock('ui-modules', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai');
  const { createContext } = jest.requireActual<typeof import('react')>('react');
  return {
    sidePanelDraftState: atom(null),
    sidePanelHistoryState: atom([]),
    sidePanelSessionState: atom(0),
    SidePanelRecordPathContext: createContext(null),
    SidePanelDraftContext: createContext(null),
    parseSidePanelRecord: (path: string) => {
      const [, , contentType, contentId] = path.split('/');
      return contentType && contentId ? { contentType, contentId } : null;
    },
  };
});

const View = ({ record }: IRecordViewProps) => {
  const [value, setValue] = useState('');
  const draft = useContext(SidePanelDraftContext);
  return (
    <div>
      <input
        aria-label={record.contentType}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <span>{String(draft?.defaults.name || '')}</span>
    </div>
  );
};

it('retains form values and the original draft while a linked record is open', () => {
  const store = createStore();
  store.set(sidePanelDraftState, {
    contentType: 'customer',
    defaults: { name: 'First draft' },
  });
  const tree = (path: string) => (
    <Provider store={store}>
      <SidePanelRecordStack path={path} View={View} onClose={jest.fn()} />
    </Provider>
  );
  const { rerender } = render(tree('/detail/customer/new'));
  fireEvent.change(screen.getByRole('textbox', { name: 'customer' }), {
    target: { value: 'Unsaved name' },
  });

  act(() => {
    store.set(sidePanelHistoryState, ['/detail/customer/new']);
    store.set(sidePanelDraftState, {
      contentType: 'company',
      defaults: { name: 'Second draft' },
    });
  });
  rerender(tree('/detail/company/new'));
  expect(screen.queryByRole('textbox', { name: 'customer' })).toBeNull();
  expect(screen.getByRole('textbox', { name: 'company' })).toBeTruthy();

  act(() => store.set(sidePanelHistoryState, []));
  rerender(tree('/detail/customer/new'));
  expect(
    (screen.getByRole('textbox', { name: 'customer' }) as HTMLInputElement)
      .value,
  ).toBe('Unsaved name');
  expect(screen.getByText('First draft')).toBeTruthy();
  expect(screen.queryByText('Second draft')).toBeNull();
});

it('starts with a fresh form when the panel session is restarted', () => {
  const store = createStore();
  const tree = () => (
    <Provider store={store}>
      <SidePanelRecordStack
        path="/detail/customer/new"
        View={View}
        onClose={jest.fn()}
      />
    </Provider>
  );
  const { rerender } = render(tree());
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Old draft' },
  });
  act(() => store.set(sidePanelSessionState, 1));
  rerender(tree());
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
});
