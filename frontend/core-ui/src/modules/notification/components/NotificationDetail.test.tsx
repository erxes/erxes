/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { NotificationDetail } from './NotificationDetail';

let mockNotification = { _id: 'first', contentType: 'core:welcome' };
jest.mock('@/notification/context/NotificationContext', () => ({
  useNotificationContext: () => ({
    notification: mockNotification,
    loading: false,
  }),
}));
jest.mock('@/notification/components/NotificationContentWrapper', () => ({
  NotificationContentWrapper: () => <p>Notification body</p>,
}));
jest.mock('@/notification/components/NoNotificationSelected', () => ({
  NoNotificationSelected: () => <p>No selection</p>,
}));
jest.mock('erxes-ui', () => {
  const { ScrollArea } =
    jest.requireActual<typeof import('radix-ui')>('radix-ui');
  return {
    ScrollArea: ({ children }: React.PropsWithChildren) => (
      <ScrollArea.Root>
        <ScrollArea.Viewport data-testid="body-viewport">
          {children}
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    ),
    Spinner: () => <p>Loading</p>,
  };
});
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

it('starts each notification at the top while retaining the host on unrelated renders', () => {
  const { rerender } = render(<NotificationDetail />);
  const first = screen.getByTestId('body-viewport');
  first.scrollTop = 240;
  rerender(<NotificationDetail />);
  expect(screen.getByTestId('body-viewport')).toBe(first);
  expect(first.scrollTop).toBe(240);
  mockNotification = { _id: 'second', contentType: 'core:welcome' };
  rerender(<NotificationDetail />);
  expect(screen.getByTestId('body-viewport').scrollTop).toBe(0);
});
