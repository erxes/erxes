import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  PropsWithChildren,
} from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'erxes-ui';
import { ADD_INTEGRATION } from '@/integrations/graphql/mutations/AddIntegration';
import { WhatsappIntegrationDetail } from '../WhatsappIntegrationDetail';
import {
  WHATSAPP_DISCARD_CONNECTION,
  WHATSAPP_EMBEDDED_SIGNUP_CONFIG,
} from '../graphql';

jest.mock('erxes-ui', () => {
  const { createContext, forwardRef, useContext } =
    jest.requireActual<typeof import('react')>('react');
  const { Controller, FormProvider, useFormState } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const Wrap = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const FieldName = createContext('');
  const Field = (props: Parameters<typeof Controller>[0]) => (
    <FieldName.Provider value={props.name}>
      <Controller {...props} />
    </FieldName.Provider>
  );
  const Message = () => {
    const name = useContext(FieldName);
    const { errors } = useFormState({ name });
    const message = errors[name]?.message;

    return message ? <p role="alert">{String(message)}</p> : null;
  };
  return {
    Badge: Wrap,
    Button: ({
      children,
      onClick,
      disabled,
      type,
      form,
    }: ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button type={type} onClick={onClick} disabled={disabled} form={form}>
        {children}
      </button>
    ),
    Input: forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
      (props, ref) => <input {...props} ref={ref} aria-label={props.name} />,
    ),
    Form: Object.assign(FormProvider, {
      Field,
      Item: Wrap,
      Label: Wrap,
      Control: Wrap,
      Description: Wrap,
      Message,
    }),
    Sheet: Object.assign(
      ({
        children,
        onOpenChange,
      }: PropsWithChildren<{ onOpenChange: (open: boolean) => void }>) => (
        <div>
          <button onClick={() => onOpenChange(true)}>Open setup</button>
          {children}
        </div>
      ),
      {
        Trigger: () => null,
        View: Wrap,
        Header: Wrap,
        Title: Wrap,
        Close: Wrap,
        Content: Wrap,
        Footer: Wrap,
      },
    ),
    Spinner: () => <span>Loading</span>,
    toast: jest.fn(),
  };
});
jest.mock('ui-modules', () => ({
  currentOrganizationState: jest
    .requireActual<typeof import('jotai')>('jotai')
    .atom<{ type: string } | null>(null),
  SelectBrand: ({
    value,
    onValueChange,
  }: {
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <input
      aria-label="brandId"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    />
  ),
}));
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'channel-1' }),
  Link: ({ children, to }: PropsWithChildren<{ to: string }>) => (
    <a href={to}>{children}</a>
  ),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/integrations/components/IntegrationSteps', () => ({
  IntegrationSteps: ({ title }: { title: string }) => <h2>{title}</h2>,
}));
jest.mock('../translations', () => ({
  useWhatsappTranslation: () => ({ t: (key: string) => key }),
}));

const mockConnection = {
  _id: 'conn-1',
  wabaId: 'waba-1',
  phoneNumberId: '111',
  displayPhoneNumber: '+976 9911 2233',
  verifiedName: 'Acme',
  phoneStatus: 'PENDING',
  needsRegistration: true,
  healthStatus: 'healthy',
};

jest.mock('../useWhatsappEmbeddedSignup', () => ({
  useWhatsappEmbeddedSignup: ({
    onConnected,
  }: {
    onConnected: (connection: typeof mockConnection) => void;
  }) => ({
    launch: () => onConnected(mockConnection),
    phase: 'idle',
    sdkStatus: 'ready',
  }),
}));

const discardMock = (result: jest.Mock) => ({
  request: {
    query: WHATSAPP_DISCARD_CONNECTION,
    variables: { _id: 'conn-1' },
  },
  result,
});

beforeEach(() => {
  jest.clearAllMocks();
});

const configMock = (isConfigured: boolean) => ({
  request: { query: WHATSAPP_EMBEDDED_SIGNUP_CONFIG },
  result: {
    data: {
      whatsappEmbeddedSignupConfig: {
        appId: isConfigured ? '123' : '',
        configId: isConfigured ? '456' : '',
        graphVersion: 'v25.0',
        isConfigured,
      },
    },
  },
});

test('connects a number through Meta, then creates the inbox with the PIN', async () => {
  const created = jest.fn(() => ({
    data: { integrationsCreateExternalIntegration: { _id: 'inbox-1' } },
  }));
  const discarded = jest.fn(() => ({
    data: { whatsappDiscardConnection: true },
  }));

  render(
    <MockedProvider
      addTypename={false}
      mocks={[
        configMock(true),
        {
          request: {
            query: ADD_INTEGRATION,
            variables: {
              kind: 'whatsapp-messenger',
              name: 'Acme',
              brandId: 'brand-1',
              channelId: 'channel-1',
              data: { connectionId: 'conn-1', pin: '123456' },
            },
          },
          result: created,
        },
        discardMock(discarded),
      ]}
    >
      <WhatsappIntegrationDetail />
    </MockedProvider>,
  );

  fireEvent.click(screen.getByText('Open setup'));
  fireEvent.click(await screen.findByText('continueWithMeta'));

  expect(await screen.findByText('+976 9911 2233')).toBeTruthy();
  expect(screen.getByLabelText('name')).toHaveProperty('value', 'Acme');

  fireEvent.change(screen.getByLabelText('brandId'), {
    target: { value: 'brand-1' },
  });
  fireEvent.change(screen.getByLabelText('pin'), {
    target: { value: '123456' },
  });
  fireEvent.click(screen.getByText('finish'));

  await waitFor(() => expect(created).toHaveBeenCalled());
  await waitFor(() => expect(screen.queryByText('finish')).toBeNull());
  expect(toast).toHaveBeenCalledWith({ title: 'created', variant: 'success' });
  // The connection now belongs to the inbox; closing must not discard it.
  expect(discarded).not.toHaveBeenCalled();
});

test('discards the unused connection when the sheet closes before finishing', async () => {
  const discarded = jest.fn(() => ({
    data: { whatsappDiscardConnection: true },
  }));
  const { unmount } = render(
    <MockedProvider
      addTypename={false}
      mocks={[configMock(true), discardMock(discarded)]}
    >
      <WhatsappIntegrationDetail />
    </MockedProvider>,
  );

  fireEvent.click(screen.getByText('Open setup'));
  fireEvent.click(await screen.findByText('continueWithMeta'));
  await screen.findByText('+976 9911 2233');

  unmount();

  await waitFor(() => expect(discarded).toHaveBeenCalledTimes(1));
});

test('discards the previous connection when choosing another number', async () => {
  const discarded = jest.fn(() => ({
    data: { whatsappDiscardConnection: true },
  }));

  render(
    <MockedProvider
      addTypename={false}
      mocks={[configMock(true), discardMock(discarded)]}
    >
      <WhatsappIntegrationDetail />
    </MockedProvider>,
  );

  fireEvent.click(screen.getByText('Open setup'));
  fireEvent.click(await screen.findByText('continueWithMeta'));
  fireEvent.click(await screen.findByText('changeNumber'));

  expect(await screen.findByText('continueWithMeta')).toBeTruthy();
  await waitFor(() => expect(discarded).toHaveBeenCalledTimes(1));
});

test('validates the brand and PIN before creating', async () => {
  const discarded = jest.fn(() => ({
    data: { whatsappDiscardConnection: true },
  }));

  render(
    <MockedProvider
      addTypename={false}
      mocks={[configMock(true), discardMock(discarded)]}
    >
      <WhatsappIntegrationDetail />
    </MockedProvider>,
  );

  fireEvent.click(screen.getByText('Open setup'));
  fireEvent.click(await screen.findByText('continueWithMeta'));
  fireEvent.change(await screen.findByLabelText('pin'), {
    target: { value: '12' },
  });
  fireEvent.click(screen.getByText('finish'));

  expect(await screen.findByText('pinInvalid')).toBeTruthy();
  expect(screen.getByText('brandRequired')).toBeTruthy();
});

test("requires the customer's own PIN for a number that still needs registering", async () => {
  const created = jest.fn();

  render(
    <MockedProvider
      addTypename={false}
      mocks={[
        configMock(true),
        discardMock(
          jest.fn(() => ({ data: { whatsappDiscardConnection: true } })),
        ),
      ]}
    >
      <WhatsappIntegrationDetail />
    </MockedProvider>,
  );

  fireEvent.click(screen.getByText('Open setup'));
  fireEvent.click(await screen.findByText('continueWithMeta'));
  fireEvent.change(await screen.findByLabelText('brandId'), {
    target: { value: 'brand-1' },
  });
  fireEvent.click(screen.getByText('finish'));

  expect(await screen.findByText('pinRequired')).toBeTruthy();
  expect(screen.getByText('pinHint')).toBeTruthy();
  expect(created).not.toHaveBeenCalled();
});

test('guides admins to the config page when Embedded Signup is not configured', async () => {
  render(
    <MockedProvider addTypename={false} mocks={[configMock(false)]}>
      <WhatsappIntegrationDetail />
    </MockedProvider>,
  );

  fireEvent.click(screen.getByText('Open setup'));

  expect(await screen.findByText('notConfigured')).toBeTruthy();
  expect(
    screen.getByText('openConfig').closest('a')?.getAttribute('href'),
  ).toBe('/frontline/settings/config');
  expect(screen.queryByText('continueWithMeta')).toBeNull();
});

test('tells SaaS admins to contact support instead of linking to hidden settings', async () => {
  const { currentOrganizationState } = jest.requireMock<{
    currentOrganizationState: import('jotai').PrimitiveAtom<{
      type: string;
    } | null>;
  }>('ui-modules');
  const { Provider, createStore } =
    jest.requireActual<typeof import('jotai')>('jotai');
  const store = createStore();
  store.set(currentOrganizationState, { type: 'saas' });

  render(
    <Provider store={store}>
      <MockedProvider addTypename={false} mocks={[configMock(false)]}>
        <WhatsappIntegrationDetail />
      </MockedProvider>
    </Provider>,
  );

  fireEvent.click(screen.getByText('Open setup'));

  expect(await screen.findByText('notConfiguredSaas')).toBeTruthy();
  expect(screen.queryByText('openConfig')).toBeNull();
});
