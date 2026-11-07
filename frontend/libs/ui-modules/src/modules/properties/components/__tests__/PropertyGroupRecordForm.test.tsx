/** @jest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PropertyGroupForm } from '../PropertyGroupForm';
import { Sheet } from 'erxes-ui';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));
jest.mock('erxes-ui', () => ({
  ...jest.requireActual('../../../../../../erxes-ui/src/components/form'),
  ...jest.requireActual('../../../../../../erxes-ui/src/components/input'),
  ...jest.requireActual('../../../../../../erxes-ui/src/components/button'),
  ...jest.requireActual('../../../../../../erxes-ui/src/components/sheet'),
  ...jest.requireActual('../../../../../../erxes-ui/src/components/switch'),
  Spinner: () => null,
}));

it('validates and saves a record form without a Sheet root or duplicate header', async () => {
  const submit = jest.fn();
  render(
    <>
      <h2>New group</h2>
      <PropertyGroupForm
        layout="record"
        locked
        loading={false}
        contentType="core:customer"
        defaultValues={{ name: '', code: '' }}
        onSubmit={submit}
        onCancel={() => undefined}
      />
    </>,
  );
  expect(screen.getAllByRole('heading')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  expect(await screen.findByText('Group name is required')).toBeTruthy();
  expect(submit).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Group Name'), {
    target: { value: 'General' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  await waitFor(() =>
    expect(submit).toHaveBeenCalledWith({
      name: 'General',
      code: 'general',
      isMultiple: false,
    }),
  );
});

it('cancels a valid record form without submitting it', async () => {
  const submit = jest.fn();
  const cancel = jest.fn();
  render(
    <PropertyGroupForm
      layout="record"
      locked
      loading={false}
      contentType="core:customer"
      defaultValues={{ name: 'General', code: 'general' }}
      onSubmit={submit}
      onCancel={cancel}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(cancel).toHaveBeenCalledTimes(1));
  expect(submit).not.toHaveBeenCalled();
});

it('retains the default sheet header and close control', () => {
  render(
    <Sheet open onOpenChange={() => undefined}>
      <PropertyGroupForm
        locked
        loading={false}
        contentType="core:customer"
        defaultValues={{ name: 'General', code: 'general' }}
        onSubmit={() => undefined}
        onCancel={() => undefined}
      />
    </Sheet>,
  );
  expect(screen.getByRole('heading', { name: 'Add Group' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
});
