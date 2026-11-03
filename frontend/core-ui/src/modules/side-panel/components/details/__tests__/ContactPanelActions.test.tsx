/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { ContactPanelActions } from '../ContactPanelActions';
const mockCompose = jest.fn();
let mockCanEmail = true;
jest.mock('ui-modules', () => ({
  useComposeEmail: () => ({
    canComposeEmail: mockCanEmail,
    composeEmail: mockCompose,
  }),
  usePermissionCheck: () => ({ hasActionPermission: () => true }),
}));
jest.mock('erxes-ui', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
beforeEach(() => {
  mockCompose.mockClear();
  mockCanEmail = true;
});
it('starts an email addressed to the current contact', () => {
  render(
    <ContactPanelActions
      contentType="core:customer"
      contentId="customer-a"
      email="a@example.com"
      title="Customer A"
      onNote={jest.fn()}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Email' }));
  expect(mockCompose).toHaveBeenCalledWith({
    customerId: 'customer-a',
    email: 'a@example.com',
  });
});
it('opens the note composer and available conversations', () => {
  const onNote = jest.fn();
  const onMessage = jest.fn();
  render(
    <ContactPanelActions
      contentType="core:customer"
      contentId="customer-a"
      title="Customer A"
      onNote={onNote}
      onMessage={onMessage}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Add note' }));
  fireEvent.click(screen.getByRole('button', { name: 'Message' }));
  expect(onNote).toHaveBeenCalledTimes(1);
  expect(onMessage).toHaveBeenCalledTimes(1);
});
it('does not offer unavailable messaging or email actions', () => {
  mockCanEmail = false;
  render(
    <ContactPanelActions
      contentType="core:company"
      contentId="company-a"
      title="Company A"
      onNote={jest.fn()}
    />,
  );
  expect(screen.queryByRole('button', { name: 'Email' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Message' })).toBeNull();
});

it.each([
  ['example.com', 'https://example.com/'],
  ['http://example.com/path', 'http://example.com/path'],
  ['javascript:alert(1)', null],
  ['javascript://example.com/alert(1)', null],
  ['not a valid host', null],
] as const)(
  'renders only a safe website link for %s',
  (website, expectedHref) => {
    render(
      <ContactPanelActions
        contentType="core:customer"
        contentId="customer-a"
        title="Customer A"
        website={website}
        onNote={jest.fn()}
      />,
    );
    const link = screen.queryByRole('link');
    if (expectedHref) expect(link?.getAttribute('href')).toBe(expectedHref);
    else expect(link).toBeNull();
  },
);
