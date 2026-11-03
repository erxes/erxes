/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { ContactPanelPermission } from '../ContactPanelPermission';

let mockLoaded = false;
let mockAllowed = false;
jest.mock('ui-modules', () => ({
  usePermissionCheck: () => ({
    isLoaded: mockLoaded,
    hasActionPermission: () => mockAllowed,
  }),
}));
jest.mock('erxes-ui', () => ({
  Spinner: () => <span role="status">Loading</span>,
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

beforeEach(() => {
  mockLoaded = false;
  mockAllowed = false;
});
it('does not mount the contact editor or deny access before permissions load', () => {
  const { rerender } = render(
    <ContactPanelPermission creating>
      <input aria-label="Name" />
    </ContactPanelPermission>,
  );
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.queryByText('Access denied')).toBeNull();
  mockLoaded = true;
  mockAllowed = true;
  rerender(
    <ContactPanelPermission creating>
      <input aria-label="Name" />
    </ContactPanelPermission>,
  );
  expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
});
it('blocks creation after a real permission denial', () => {
  mockLoaded = true;
  render(
    <ContactPanelPermission creating>
      <input aria-label="Name" />
    </ContactPanelPermission>,
  );
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.getByText('Access denied')).toBeTruthy();
});
it('allows the saved record to choose read-only access after permissions load', () => {
  mockLoaded = true;
  render(
    <ContactPanelPermission>
      <p>Saved contact</p>
    </ContactPanelPermission>,
  );
  expect(screen.getByText('Saved contact')).toBeTruthy();
});
