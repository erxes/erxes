import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useConfirm } from 'erxes-ui';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { useJobRemove } from '@/settings/jobs/hooks/useJobMutations';
import { JobActions } from '../JobActions';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => ({
  useConfirm: jest.fn(),
}));
jest.mock('@/settings/hooks/useSettingsPanel', () => ({
  useSettingsPanel: jest.fn(),
}));
jest.mock('@/settings/jobs/hooks/useJobMutations', () => ({
  useJobRemove: jest.fn(),
}));
jest.mock('@/settings/components/SettingsRowsTable', () => ({
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

test('row edit opens the source card in the side panel and delete waits for confirmation', async () => {
  const openDetail = jest.fn();
  const removeJob = jest.fn().mockResolvedValue(undefined);
  let approve: (() => void) | undefined;
  const confirm = jest.fn().mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        approve = resolve;
      }),
  );
  jest.mocked(useSettingsPanel).mockReturnValue({
    openDraft: jest.fn(),
    openDetail,
    cancelDraft: jest.fn(),
    closePanel: jest.fn(),
  });
  jest.mocked(useConfirm).mockReturnValue({ confirm });
  jest.mocked(useJobRemove).mockReturnValue({ removeJob, loading: false });
  render(<JobActions cardId="source-card" />);
  fireEvent.click(screen.getByText('Edit'));
  expect(openDetail).toHaveBeenCalledWith('source-card');
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
