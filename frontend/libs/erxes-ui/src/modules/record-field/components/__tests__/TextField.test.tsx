/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { TextField } from '../TextField';
import { currentHotkeyScopeState } from '../../../hotkey/states/internal/currentHotkeyScopeState';

jest.mock('erxes-ui/components', () => ({
  ...jest.requireActual('../../../../components/button'),
  ...jest.requireActual('../../../../components/badge'),
  ...jest.requireActual('../../../../components/input'),
  ...jest.requireActual('../../../../components/popover'),
  TextOverflowTooltip: ({ value }: { value?: string }) => <span>{value}</span>,
}));
jest.mock('erxes-ui/lib', () => jest.requireActual('../../../../lib/utils'));
jest.mock('erxes-ui/modules/record-table', () =>
  jest.requireActual('../../../record-table/components/RecordTableCellInline'),
);
jest.mock('erxes-ui/utils/logDebug', () => ({ logDebug: jest.fn() }));

function setup() {
  const store = createStore();
  const onSave = jest.fn();
  const onOutside = jest.fn();
  store.set(currentHotkeyScopeState, { scope: 'panel', customScopes: {} });
  render(
    <Provider store={store}>
      <TextField scope="contact.name" value="Original" onSave={onSave} />
      <button onClick={onOutside}>Outside action</button>
    </Provider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Original' }));
  expect(store.get(currentHotkeyScopeState).scope).toBe('contact.name.Popover');
  return { store, onSave, onOutside, input: screen.getByRole('textbox') };
}

it('saves with Enter and restores the enclosing shortcut scope', () => {
  const { input, store, onSave } = setup();
  fireEvent.change(input, { target: { value: 'Updated' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onSave).toHaveBeenCalledTimes(1);
  expect(onSave).toHaveBeenCalledWith('Updated');
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(store.get(currentHotkeyScopeState).scope).toBe('panel');
});

it('closes an unchanged field with Enter without saving or retaining its scope', () => {
  const { input, store, onSave } = setup();
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(onSave).not.toHaveBeenCalled();
  expect(store.get(currentHotkeyScopeState).scope).toBe('panel');
});

it('discards edits with Escape and restores the enclosing scope', () => {
  const { input, store, onSave } = setup();
  fireEvent.change(input, { target: { value: 'Discarded' } });
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(onSave).not.toHaveBeenCalled();
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(store.get(currentHotkeyScopeState).scope).toBe('panel');
});

it('allows an outside action on the first click while saving the edited field', async () => {
  const user = userEvent.setup();
  const { input, store, onSave, onOutside } = setup();
  fireEvent.change(input, { target: { value: 'Updated' } });
  await user.click(screen.getByRole('button', { name: 'Outside action' }));
  expect(onOutside).toHaveBeenCalledTimes(1);
  expect(onSave).toHaveBeenCalledWith('Updated');
  expect(store.get(currentHotkeyScopeState).scope).toBe('panel');
});
