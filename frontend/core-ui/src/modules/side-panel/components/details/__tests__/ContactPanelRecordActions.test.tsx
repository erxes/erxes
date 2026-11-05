/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ContactPanelRecordActions } from '../ContactPanelRecordActions';

const mockClose = jest.fn();
let mockPanel = { close: mockClose, dismissPath: jest.fn() };
let mockComplete: () => void;

jest.mock('@apollo/client', () => ({
  useMutation: (_query: unknown, options: { onCompleted: () => void }) => [
    () => {
      mockComplete = options.onCompleted;
      return Promise.resolve();
    },
    { loading: false },
  ],
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams()],
}));
jest.mock('@/broadcast/hooks/useBroadcastContacts', () => ({
  useBroadcastContacts: () => ({ setContacts: jest.fn() }),
}));
jest.mock('@/contacts/companies/graphql/mutations/removeCompanies', () => ({
  REMOVE_COMPANIES: 'remove',
}));
jest.mock('@/contacts/companies/graphql/queries/getCompanies', () => ({
  GET_COMPANIES: 'list',
}));
jest.mock('@/contacts/customers/graphql/mutations/removeCustomers', () => ({
  CUSTOMERS_REMOVE: 'remove',
}));
jest.mock('@/contacts/customers/graphql/queries/getCustomers', () => ({
  GET_CUSTOMERS: 'list',
}));
jest.mock('erxes-ui', () => {
  const Container = ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  );
  return {
    Button: Container,
    Popover: Object.assign(Container, {
      Trigger: Container,
      Content: Container,
    }),
    Command: Object.assign(Container, {
      List: Container,
      Group: Container,
      Separator: () => null,
      Empty: () => null,
      Item: ({
        children,
        onSelect,
      }: React.PropsWithChildren<{ onSelect: () => void }>) => (
        <button onClick={onSelect}>{children}</button>
      ),
    }),
    toast: jest.fn(),
    useConfirm: () => ({ confirm: () => Promise.resolve() }),
  };
});
jest.mock('ui-modules', () => ({
  usePermissionCheck: () => ({
    hasActionPermission: (action: string) => action === 'contactsDelete',
  }),
  useExport: () => ({ loading: false, onFieldSelectionConfirm: jest.fn() }),
  useSidePanel: () => mockPanel,
  getSidePanelRecordPath: ({
    contentType,
    contentId,
  }: {
    contentType: string;
    contentId: string;
  }) =>
    `/detail/${
      contentType === 'core:customer' ? 'customer' : 'company'
    }/${contentId}`,
}));

it.each(['core:customer', 'core:company'] as const)(
  'dismisses the deleted %s using current navigation without clearing the active panel',
  async (contentType) => {
    mockClose.mockClear();
    mockPanel = { close: mockClose, dismissPath: jest.fn() };
    const previousDismiss = mockPanel.dismissPath;
    const view = render(
      <ContactPanelRecordActions
        contentType={contentType}
        contentId="contact-1"
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    });
    mockPanel = { ...mockPanel, dismissPath: jest.fn() };
    view.rerender(
      <ContactPanelRecordActions
        contentType={contentType}
        contentId="contact-1"
      />,
    );
    act(() => mockComplete());
    expect(mockPanel.dismissPath).toHaveBeenCalledWith(
      `/detail/${
        contentType === 'core:customer' ? 'customer' : 'company'
      }/contact-1`,
    );
    expect(previousDismiss).not.toHaveBeenCalled();
    expect(mockClose).not.toHaveBeenCalled();
  },
);
