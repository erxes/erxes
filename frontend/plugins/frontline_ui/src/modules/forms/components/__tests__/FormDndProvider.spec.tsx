import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useEffect, useState } from 'react';
import { FormDndProvider, useFormDnd } from '../FormDndProvider';

const mockConfirm = jest.fn<Promise<void>, [unknown]>();

jest.mock('erxes-ui', () => ({
  useConfirm: () => ({ confirm: mockConfirm }),
}));
jest.mock('nanoid', () => ({ nanoid: () => 'new-field' }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const DraftEditor = ({ fieldId }: { fieldId: string }) => {
  const { setEditingFieldDirty } = useFormDnd();
  const [label, setLabel] = useState(fieldId);

  useEffect(() => {
    setEditingFieldDirty?.(fieldId, label !== fieldId);
    return () => setEditingFieldDirty?.(fieldId, false);
  }, [fieldId, label, setEditingFieldDirty]);

  return (
    <input
      aria-label="Draft label"
      value={label}
      onChange={(event) => setLabel(event.target.value)}
    />
  );
};

const EditorControls = () => {
  const { editingFieldId, setEditingFieldId } = useFormDnd();
  return (
    <>
      <button onClick={() => setEditingFieldId('first')}>First field</button>
      <button onClick={() => setEditingFieldId('second')}>Second field</button>
      <button onClick={() => setEditingFieldId(null)}>Close</button>
      <output aria-label="Editing field">{editingFieldId}</output>
      {editingFieldId && (
        <DraftEditor key={editingFieldId} fieldId={String(editingFieldId)} />
      )}
    </>
  );
};

const renderEditor = () =>
  render(
    <FormDndProvider value={{}} onValueChange={() => undefined}>
      <EditorControls />
    </FormDndProvider>,
  );

beforeEach(() => mockConfirm.mockReset());

test('keeps the current field and its draft when switching is dismissed', async () => {
  mockConfirm.mockImplementation(() => new Promise<void>(() => undefined));
  renderEditor();
  fireEvent.click(screen.getByText('First field'));
  fireEvent.change(screen.getByLabelText('Draft label'), {
    target: { value: 'Unconfirmed label' },
  });

  fireEvent.click(screen.getByText('Second field'));

  await waitFor(() =>
    expect(screen.getByLabelText('Editing field').textContent).toBe('first'),
  );
  expect(screen.getByLabelText('Draft label')).toMatchObject({
    value: 'Unconfirmed label',
  });
});

test('can switch after a dismissed confirmation when the next attempt is confirmed', async () => {
  mockConfirm
    .mockImplementationOnce(() => new Promise<void>(() => undefined))
    .mockResolvedValueOnce(undefined);
  renderEditor();
  fireEvent.click(screen.getByText('First field'));
  fireEvent.change(screen.getByLabelText('Draft label'), {
    target: { value: 'Unconfirmed label' },
  });
  fireEvent.click(screen.getByText('Second field'));
  expect(screen.getByLabelText('Editing field').textContent).toBe('first');

  fireEvent.click(screen.getByText('Second field'));

  await waitFor(() =>
    expect(screen.getByLabelText('Editing field').textContent).toBe('second'),
  );
  expect(screen.getByLabelText('Draft label')).toMatchObject({
    value: 'second',
  });
});

test('switches a clean field immediately without a confirmation', () => {
  renderEditor();
  fireEvent.click(screen.getByText('First field'));
  fireEvent.click(screen.getByText('Second field'));

  expect(screen.getByLabelText('Editing field').textContent).toBe('second');
  expect(mockConfirm).not.toHaveBeenCalled();
});

test('does not reopen a field after the editor closed while confirmation was pending', async () => {
  let confirmSwitch: (() => void) | undefined;
  mockConfirm.mockImplementation(
    () => new Promise<void>((resolve) => (confirmSwitch = resolve)),
  );
  renderEditor();
  fireEvent.click(screen.getByText('First field'));
  fireEvent.change(screen.getByLabelText('Draft label'), {
    target: { value: 'Unconfirmed label' },
  });
  fireEvent.click(screen.getByText('Second field'));
  fireEvent.click(screen.getByText('Close'));

  await act(async () => confirmSwitch?.());

  expect(screen.getByLabelText('Editing field').textContent).toBe('');
});

test('switches without confirming when edits have been reverted', () => {
  renderEditor();
  fireEvent.click(screen.getByText('First field'));
  fireEvent.change(screen.getByLabelText('Draft label'), {
    target: { value: 'Unconfirmed label' },
  });
  fireEvent.change(screen.getByLabelText('Draft label'), {
    target: { value: 'first' },
  });

  fireEvent.click(screen.getByText('Second field'));

  expect(screen.getByLabelText('Editing field').textContent).toBe('second');
  expect(mockConfirm).not.toHaveBeenCalled();
});
