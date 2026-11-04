import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import type { ITicketDetail } from '@/ticket/types';
import { TicketDetailActions } from '../TicketDetailActions';

const mockConfirm = jest.fn();
const mockRemove = jest.fn();
jest.mock('erxes-ui', () => {
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    Button: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button {...props} />
    ),
    DropdownMenu: Object.assign(Container, {
      Trigger: Container,
      Content: Container,
      Separator: () => null,
      Item: ({
        children,
        onSelect,
        disabled,
      }: PropsWithChildren<{ onSelect: () => void; disabled?: boolean }>) => (
        <button disabled={disabled} onClick={onSelect}>
          {children}
        </button>
      ),
    }),
    useConfirm: () => ({ confirm: mockConfirm }),
    useToast: () => ({ toast: jest.fn() }),
  };
});
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/ticket/hooks/useRemoveTicket', () => ({
  useTicketRemove: () => ({ removeTicket: mockRemove }),
}));
jest.mock('@/ticket/hooks/useUpdateTicket', () => ({
  useUpdateTicket: () => ({ updateTicket: jest.fn() }),
}));
jest.mock('@/ticket/hooks/useToggleTicketArchive', () => ({
  useToggleTicketArchive: () => ({ toggleArchive: jest.fn() }),
}));

it('keeps actions usable when a delete confirmation is dismissed without settling', () => {
  mockConfirm.mockImplementation(() => new Promise<void>(() => undefined));
  const ticket: ITicketDetail = {
    _id: 'ticket-1',
    state: 'active',
    name: null,
    pipelineId: null,
    statusId: null,
    assigneeId: null,
    attachments: [],
    description: null,
    priority: null,
    labelIds: null,
    tagIds: null,
    assignedMembers: null,
    userId: null,
    startDate: null,
    targetDate: null,
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    channelId: null,
    branchId: null,
    departmentId: null,
    statusChangedDate: null,
    number: null,
    propertiesData: null,
    customerId: null,
    companyId: null,
    isSubscribed: null,
  };
  render(<TicketDetailActions ticket={ticket} />);
  act(() => {
    fireEvent.click(screen.getByText('delete'));
  });
  expect(mockConfirm).toHaveBeenCalledTimes(1);
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'actions' }).disabled,
  ).toBe(false);
  expect(mockRemove).not.toHaveBeenCalled();
  act(() => {
    fireEvent.click(screen.getByText('delete'));
  });
  expect(mockConfirm).toHaveBeenCalledTimes(2);
});
