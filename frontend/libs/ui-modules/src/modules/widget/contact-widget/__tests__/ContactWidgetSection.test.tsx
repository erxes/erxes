/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { IconMessage } from '@tabler/icons-react';
import { ContactOverviewSectionContext } from '../ContactOverviewContext';
import { ContactWidgetSection } from '../ContactWidgetSection';

jest.mock('erxes-ui', () => ({
  Button: ({
    children,
    variant,
    size,
    ...props
  }: React.PropsWithChildren<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: string;
      size?: string;
    }
  >) => (
    <button {...props} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
  cn: (...values: (string | false)[]) => values.filter(Boolean).join(' '),
  Skeleton: () => <div />,
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string, params?: { count: number }) =>
      fallback.replace('{{count}}', String(params?.count)),
  }),
}));

it('shows a pinned section without a repeated title, and keeps its create action', () => {
  const create = jest.fn();
  render(
    <ContactOverviewSectionContext.Provider
      value={{
        folded: true,
        setFolded: jest.fn(),
        standalone: true,
        access: 'write',
      }}
    >
      <ContactWidgetSection
        icon={IconMessage}
        label="Conversations"
        ids={['conversation-1']}
        renderItem={(id) => (
          <a href={`/conversation/${id}`}>Linked conversation</a>
        )}
        onCreate={create}
        createLabel="New conversation"
      />
    </ContactOverviewSectionContext.Provider>,
  );
  expect(screen.queryByText('Conversations')).toBeNull();
  expect(screen.getByRole('status').textContent).toBe('1 linked');
  expect(screen.getByRole('link').getAttribute('href')).toBe(
    '/conversation/conversation-1',
  );
  fireEvent.click(screen.getByRole('button', { name: 'New conversation' }));
  expect(create).toHaveBeenCalledTimes(1);
});

it('retains the foldable section heading in Relations', () => {
  const fold = jest.fn();
  render(
    <ContactOverviewSectionContext.Provider
      value={{ folded: true, setFolded: fold, access: 'read' }}
    >
      <ContactWidgetSection
        icon={IconMessage}
        label="Conversations"
        ids={[]}
        renderItem={() => null}
        onCreate={jest.fn()}
        createLabel="New conversation"
      />
    </ContactOverviewSectionContext.Provider>,
  );
  expect(screen.queryByRole('button', { name: 'New conversation' })).toBeNull();
  const heading = screen.getByRole('button', { name: /Conversations/ });
  expect(heading.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(heading);
  expect(fold).toHaveBeenCalledWith(false);
});
