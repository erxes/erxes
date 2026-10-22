import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useConfirm, useQueryState } from 'erxes-ui';
import { useJobRemove } from '../../hooks/useJobMutations';
import { JobActions } from '../JobActions';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => ({
  useConfirm: jest.fn(),
  useQueryState: jest.fn(),
}));
jest.mock('../../hooks/useJobMutations', () => ({
  useJobRemove: jest.fn(),
}));
jest.mock('../../../components/SettingsRowsTable', () => ({
  MoreActionsCell: ({
    onEdit,
    onDelete,
  }: {
    onEdit: () => void;
    onDelete: () => void;
  }) => (
    <>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </>
  ),
}));

test('shared row actions edit and delete the source card after confirmation', async () => {
  const setOpen = jest.fn();
  const removeJob = jest.fn().mockResolvedValue(undefined);
  let approve: (() => void) | undefined;
  const confirm = jest.fn().mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        approve = resolve;
      }),
  );
  jest.mocked(useQueryState).mockReturnValue([null, setOpen]);
  jest.mocked(useConfirm).mockReturnValue({ confirm });
  jest.mocked(useJobRemove).mockReturnValue({ removeJob, loading: false });
  render(<JobActions cardId="source-card" />);
  fireEvent.click(screen.getByText('Edit'));
  expect(setOpen).toHaveBeenCalledWith('source-card');
  fireEvent.click(screen.getByText('Delete'));
  expect(confirm).toHaveBeenCalledWith({
    message: 'job-confirm-delete',
    options: { okLabel: 'delete', cancelLabel: 'cancel' },
  });
  expect(removeJob).not.toHaveBeenCalled();
  approve?.();
  await waitFor(() =>
    expect(removeJob).toHaveBeenCalledWith({
      variables: { _id: 'source-card' },
    }),
  );
});
