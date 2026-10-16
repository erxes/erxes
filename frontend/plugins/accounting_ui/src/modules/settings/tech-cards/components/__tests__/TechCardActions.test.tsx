import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useConfirm, useQueryState } from 'erxes-ui';
import { useTechCardRemove } from '../../hooks/useTechCardMutations';
import { TechCardActions } from '../TechCardActions';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => ({
  useConfirm: jest.fn(),
  useQueryState: jest.fn(),
}));
jest.mock('../../hooks/useTechCardMutations', () => ({
  useTechCardRemove: jest.fn(),
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
  const removeTechCard = jest.fn().mockResolvedValue(undefined);
  let approve: (() => void) | undefined;
  const confirm = jest.fn().mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        approve = resolve;
      }),
  );
  jest.mocked(useQueryState).mockReturnValue([null, setOpen]);
  jest.mocked(useConfirm).mockReturnValue({ confirm });
  jest
    .mocked(useTechCardRemove)
    .mockReturnValue({ removeTechCard, loading: false });
  render(<TechCardActions cardId="source-card" />);
  fireEvent.click(screen.getByText('Edit'));
  expect(setOpen).toHaveBeenCalledWith('source-card');
  fireEvent.click(screen.getByText('Delete'));
  expect(confirm).toHaveBeenCalledWith({
    message: 'tech-card-confirm-delete',
    options: { okLabel: 'delete', cancelLabel: 'cancel' },
  });
  expect(removeTechCard).not.toHaveBeenCalled();
  approve?.();
  await waitFor(() =>
    expect(removeTechCard).toHaveBeenCalledWith({
      variables: { _id: 'source-card' },
    }),
  );
});
