import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { readImage } from 'erxes-ui';
import { NotificationItem } from '../NotificationItem';
import type { NotificationItemProps } from '@/notification/types/myInbox';

jest.mock('erxes-ui', () => ({
  Avatar: Object.assign(
    ({ children }: { children: ReactNode }) => <span>{children}</span>,
    {
      Image: ({ src, alt }: { src: string; alt: string }) => (
        <img src={src} alt={alt} />
      ),
      Fallback: ({ children }: { children: ReactNode }) => (
        <span>{children}</span>
      ),
    },
  ),
  Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  Button: ({ children }: { children: ReactNode }) => <>{children}</>,
  cn: (...values: unknown[]) => values.filter(Boolean).join(' '),
  ErxesLogoIcon: () => <svg data-testid="erxes-logo" />,
  readImage: jest.fn((value: string) =>
    value ? `/read-file?key=${value}` : '',
  ),
  RelativeDateDisplay: { Value: () => null },
}));
jest.mock('react-router-dom', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    useParams: () => ({}),
    Link: React.forwardRef<
      HTMLAnchorElement,
      Omit<React.ComponentPropsWithoutRef<'a'>, 'href'> & { to: string }
    >(({ to, ...props }, ref) => <a ref={ref} href={to} {...props} />),
  };
});
jest.mock('jotai', () => ({
  useAtomValue: () => ({ showSender: false, showPriority: true }),
}));
jest.mock('@/notification/states/notificationState', () => ({
  inboxDisplayOptionsState: {},
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

const notification: NotificationItemProps = {
  _id: 'notification-1',
  title: 'New triage',
  message: 'Your team has a new triage',
  createdAt: '2026-10-22T00:00:00Z',
  isRead: false,
  priority: 'low',
  contentType: 'operation:triage',
  selected: false,
  selectionFocused: false,
  onOpen: jest.fn(),
};

describe('notification author avatar', () => {
  it('uses the author image and preserves the unread marker and inbox link', () => {
    const { container, rerender } = render(
      <NotificationItem
        {...notification}
        fromUser={{
          _id: 'author-1',
          isOnboarded: true,
          email: 'author@example.com',
          details: { fullName: 'Author Name', avatar: 'author.png' },
        }}
      />,
    );

    expect(readImage).toHaveBeenCalledWith('author.png');
    expect(
      screen.getByRole('img', { name: 'Author Name' }).getAttribute('src'),
    ).toBe('/read-file?key=author.png');
    expect(screen.queryByTestId('erxes-logo')).toBeNull();
    expect(container.querySelector('.bg-destructive')).not.toBeNull();
    expect(container.querySelector('.bg-destructive')?.textContent).toBe('1');
    expect(
      container
        .querySelector('.bg-destructive')
        ?.classList.contains('text-white'),
    ).toBe(true);
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/my-inbox/notification-1',
    );
    fireEvent.click(screen.getByRole('link'));
    expect(notification.onOpen).toHaveBeenCalled();

    rerender(<NotificationItem {...notification} isRead />);
    expect(container.querySelector('.bg-destructive')).toBeNull();
  });

  it.each([
    { details: { fullName: 'Author Name' }, initial: 'A' },
    { details: undefined, initial: 'E' },
  ])(
    'provides an author initial when the image is missing: $initial',
    ({ details, initial }) => {
      render(
        <NotificationItem
          {...notification}
          fromUser={{
            _id: 'author-1',
            isOnboarded: true,
            email: 'email@example.com',
            details,
          }}
        />,
      );

      expect(screen.getByText(initial)).not.toBeNull();
      expect(screen.queryByTestId('erxes-logo')).toBeNull();
    },
  );

  it.each(['core:system', 'operation:triage', ''])(
    'shows the erxes logo for notifications without an author: %s',
    (contentType) => {
      render(<NotificationItem {...notification} contentType={contentType} />);

      expect(screen.getByTestId('erxes-logo')).not.toBeNull();
      expect(screen.queryByRole('img')).toBeNull();
    },
  );
});
