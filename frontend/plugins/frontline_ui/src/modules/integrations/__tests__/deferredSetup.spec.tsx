import { flushProviderUpdates } from './fixtures/providerUi';
import type {
  TextareaHTMLAttributes,
  ReactNode,
  PropsWithChildren,
} from 'react';
import { useLayoutEffect } from 'react';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
  type Operation,
} from '@apollo/client';
import { parse } from 'graphql';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createStore, Provider, useAtom, useStore } from 'jotai';
import { IntegrationDraftContext } from '../hooks/useIntegrationDraft';
import { useMessengerDraft } from '../erxes-messenger/hooks/useMessengerDraft';
import { useEMEditSave } from '../erxes-messenger/hooks/useEMEditSave';
import { EMConfig } from '../erxes-messenger/components/EMConfig';
import {
  erxesMessengerSetupConfigAtom,
  erxesMessengerSetupGreetingAtom,
  settedIntegrationDetailAtom,
} from '../erxes-messenger/states/erxesMessengerSetupStates';
import { FacebookIntegrationSetup } from '../facebook/components/FacebookIntegrationSetup';
import { InstagramIntegrationSetup } from '../instagram/components/InstagramIntegrationSetup';

const mockClose = jest.fn();
let serverGreeting = 'Saved greeting';
jest.mock('ui-modules', () => {
  const { BrandInput, Wrap } = jest.requireActual<
    typeof import('./fixtures/providerUi')
  >('./fixtures/providerUi');
  return {
    useSidePanel: () => ({ close: mockClose }),
    PanelFormRow: Wrap,
    SelectBrand: BrandInput,
    SelectBrands: { FormItem: BrandInput },
  };
});
jest.mock('erxes-ui', () => {
  const { forwardRef } = jest.requireActual<typeof import('react')>('react');
  const { createProviderUi, Wrap } = jest.requireActual<
    typeof import('./fixtures/providerUi')
  >('./fixtures/providerUi');
  return {
    ...createProviderUi(),
    Tabs: Object.assign(Wrap, { List: Wrap, Trigger: Wrap, Content: Wrap }),
    Textarea: forwardRef<
      HTMLTextAreaElement,
      TextareaHTMLAttributes<HTMLTextAreaElement>
    >((props, ref) => (
      <textarea
        {...props}
        value={props.value ?? ''}
        aria-label={props.name}
        ref={ref}
      />
    )),
    Tooltip: Object.assign(Wrap, {
      Provider: Wrap,
      Trigger: Wrap,
      Content: Wrap,
    }),
    Popover: Object.assign(Wrap, { Trigger: Wrap, Content: Wrap }),
    Combobox: { Trigger: Wrap, Content: Wrap, Value: Wrap, Check: Wrap },
    Command: Object.assign(Wrap, { Input: () => null, List: Wrap, Item: Wrap }),
    Select: Object.assign(Wrap, {
      Trigger: Wrap,
      Content: Wrap,
      Value: Wrap,
      Item: Wrap,
    }),
    Switch: () => null,
    Badge: Wrap,
    Spinner: () => null,
    toast: jest.fn(),
    useConfirm: () => ({ confirm: () => Promise.resolve() }),
    isDeeplyEqual: (left: unknown, right: unknown) =>
      JSON.stringify(left) === JSON.stringify(right),
    isDefined: (value: unknown) => value != null,
  };
});
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'channel-a' }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('../erxes-messenger/components/EMLayout', () => ({
  EMLayout: ({
    children,
    actions,
  }: PropsWithChildren<{ actions: React.ReactNode }>) => (
    <>
      {children}
      {actions}
    </>
  ),
  EMLayoutPreviousStepButton: () => null,
}));
jest.mock('../erxes-messenger/components/EMTicketConfigPicker', () => ({
  EMTicketConfigPicker: () => null,
}));
jest.mock('../erxes-messenger/components/EMKbTopicPicker', () => ({
  EMKbTopicPicker: () => null,
}));
jest.mock('../erxes-messenger/components/EMMessengerAutomations', () => ({
  EMMessengerAutomations: () => null,
}));
jest.mock('../facebook/components/FacebookIntegrationForm', () => ({
  FacebookIntegrationFormLayout: ({
    children,
    actions,
  }: PropsWithChildren<{ actions: React.ReactNode }>) => (
    <>
      {children}
      {actions}
    </>
  ),
  FacebookIntegrationFormSteps: () => null,
}));
jest.mock('../instagram/components/InstagramIntegrationForm', () => ({
  InstagramIntegrationFormLayout: ({
    children,
    actions,
  }: PropsWithChildren<{ actions: React.ReactNode }>) => (
    <>
      {children}
      {actions}
    </>
  ),
  InstagramIntegrationFormSteps: () => null,
}));

type Pending = {
  operation: Operation;
  resolve: (data: Record<string, unknown>) => void;
  reject: (error: Error) => void;
};
const createNetwork = () => {
  const pending: Pending[] = [];
  const operations: Operation[] = [];
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          operations.push(operation);
          if (
            [
              'IntegrationsEditMessengerIntegration',
              'IntegrationsCreateExternalIntegration',
            ].includes(operation.operationName)
          ) {
            pending.push({
              operation,
              resolve: (data) => {
                observer.next({ data });
                observer.complete();
              },
              reject: (error) => observer.error(error),
            });
            return;
          }
          const field =
            operation.operationName === 'integrationsSaveMessengerConfigs'
              ? 'integrationsSaveMessengerConfigs'
              : 'integrationsSaveMessengerAppearanceData';
          observer.next({
            data: operation.query.definitions.some(
              (definition) =>
                definition.kind === 'OperationDefinition' &&
                definition.operation === 'query',
            )
              ? { __typename: 'Query' }
              : { [field]: { _id: 'integration-a' } },
          });
          observer.complete();
        }),
    ),
  });
  const refetch = jest.spyOn(client, 'refetchQueries').mockResolvedValue([]);
  const subscriptions = [
    'Integrations',
    'FacebookGetIntegrations',
    'IntegrationDetail',
    'IntegrationsGetUsedTypes',
    'IntegrationsGetUsedTypesByChannel',
    'DiscordConnectedServers',
    'DiscordTakenChannels',
  ].map((name) =>
    client
      .watchQuery({
        query: parse(`query ${name} { __typename }`),
        fetchPolicy: 'cache-only',
      })
      .subscribe(() => undefined),
  );
  return {
    client,
    pending,
    operations,
    refetch,
    dispose: () =>
      subscriptions.forEach((subscription) => subscription.unsubscribe()),
  };
};

const ToolbarSave = () => {
  const { save, loading } = useEMEditSave();
  return (
    <button type="button" disabled={loading} onClick={save}>
      save
    </button>
  );
};
const MessengerEditor = ({ entry }: { entry: 'toolbar' | 'config' }) => {
  const ready = useMessengerDraft('integration-a');
  const store = useStore();
  const [greeting, setGreeting] = useAtom(erxesMessengerSetupGreetingAtom);
  useLayoutEffect(() => {
    if (!store.get(settedIntegrationDetailAtom)) {
      store.set(erxesMessengerSetupConfigAtom, {
        name: 'Saved A',
        brandId: 'brand',
        channelId: 'channel-a',
      });
      store.set(erxesMessengerSetupGreetingAtom, { title: serverGreeting });
      store.set(settedIntegrationDetailAtom, true);
    }
  }, [store]);
  if (!ready) return null;
  return (
    <>
      <input
        aria-label="greeting"
        value={greeting?.title ?? ''}
        onChange={(event) =>
          setGreeting({ ...greeting, title: event.target.value })
        }
      />
      {entry === 'toolbar' ? <ToolbarSave /> : <EMConfig />}
    </>
  );
};

/** Submits through the actual provider form while allowing handler-level guards to run. */
const submitCurrentForm = () => {
  const form = document.querySelector('form');
  if (!form) throw new Error('Provider form missing');
  fireEvent.submit(form);
};

/** Keeps one Apollo/Jotai session alive while the provider surface is remounted. */
const mountProvider = (editor: ReactNode, context: string) => {
  const network = createNetwork();
  const store = createStore();
  const Frame = ({ visible }: { visible: boolean }) => (
    <ApolloProvider client={network.client}>
      <Provider store={store}>
        <IntegrationDraftContext.Provider value={context}>
          {visible && editor}
        </IntegrationDraftContext.Provider>
      </Provider>
    </ApolloProvider>
  );
  const mounted = render(<Frame visible />);
  return {
    network,
    remount: () => {
      mounted.rerender(<Frame visible={false} />);
      mounted.rerender(<Frame visible />);
    },
  };
};

/** Waits for the config form's deferred restoration before exercising a save. */
const waitForMessenger = async (entry: 'toolbar' | 'config'): Promise<void> => {
  if (entry === 'config') {
    await waitFor(() =>
      expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe(
        'Saved A',
      ),
    );
  }
};

/** Starts the actual toolbar or config mutation and retains its deferred response. */
const startMessengerSave = async (entry: 'toolbar' | 'config') => {
  const frame = mountProvider(<MessengerEditor entry={entry} />, 'messenger-a');
  await waitForMessenger(entry);
  fireEvent.click(screen.getByRole('button', { name: 'save' }));
  await waitFor(() => expect(frame.network.pending).toHaveLength(1));
  return frame;
};

/** Resolves the retained Messenger response and waits for its query refresh. */
const acknowledgeMessenger = async (
  network: ReturnType<typeof createNetwork>,
): Promise<void> => {
  await flushProviderUpdates(() =>
    network.pending[0].resolve({
      integrationsEditMessengerIntegration: { _id: 'integration-a' },
    }),
  );
  await waitFor(() => expect(network.refetch).toHaveBeenCalled());
};

/** Starts the chosen social provider with validated inputs and one deferred create. */
const startSocialCreate = async (provider: 'facebook' | 'instagram') => {
  const Setup =
    provider === 'facebook'
      ? FacebookIntegrationSetup
      : InstagramIntegrationSetup;
  const frame = mountProvider(<Setup />, provider);
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Support' },
  });
  fireEvent.change(screen.getByLabelText('brandId'), {
    target: { value: 'brand' },
  });
  await flushProviderUpdates(submitCurrentForm);
  await waitFor(() => expect(frame.network.pending).toHaveLength(1));
  return frame;
};

beforeEach(() => {
  jest.clearAllMocks();
  serverGreeting = 'Saved greeting';
});

it.each(
  (['toolbar', 'config'] as const).flatMap((entry) => [
    {
      entry,
      remountBeforeEdit: false,
      greeting: 'Newer greeting',
      scenario: 'save preserves edits made before deferred completion',
    },
    {
      entry,
      remountBeforeEdit: true,
      greeting: 'Reopened newer greeting',
      scenario: 'save preserves newer same-context edits after two remounts',
    },
  ]),
)(
  'Messenger $entry $scenario',
  async ({ entry, remountBeforeEdit, greeting }) => {
    const { network, remount } = await startMessengerSave(entry);
    if (remountBeforeEdit) remount();
    fireEvent.change(screen.getByLabelText('greeting'), {
      target: { value: greeting },
    });
    await acknowledgeMessenger(network);
    expect(mockClose).not.toHaveBeenCalled();
    remount();
    expect((screen.getByLabelText('greeting') as HTMLInputElement).value).toBe(
      greeting,
    );
    network.dispose();
  },
);

it.each(['facebook', 'instagram'] as const)(
  '%s create cannot repeat during pending or after confirmed response across remount',
  async (provider) => {
    const { network, remount } = await startSocialCreate(provider);
    remount();
    await flushProviderUpdates(() => submitCurrentForm());
    expect(network.pending).toHaveLength(1);
    await flushProviderUpdates(() =>
      network.pending[0].resolve({
        integrationsCreateExternalIntegration: { _id: 'created' },
      }),
    );
    await waitFor(() => expect(mockClose).toHaveBeenCalledTimes(1));
    await flushProviderUpdates(() => submitCurrentForm());
    expect(network.pending).toHaveLength(1);
    network.dispose();
  },
);

it.each(['facebook', 'instagram'] as const)(
  '%s failure after remount retains fields and releases only its request for retry',
  async (provider) => {
    const { network, remount } = await startSocialCreate(provider);
    remount();
    await flushProviderUpdates(() =>
      network.pending[0].reject(new Error('Provider offline')),
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'save' }).hasAttribute('disabled'),
      ).toBe(false),
    );
    expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe(
      'Support',
    );
    expect(mockClose).not.toHaveBeenCalled();
    await flushProviderUpdates(() => submitCurrentForm());
    await waitFor(() => expect(network.pending).toHaveLength(2));
    expect(network.pending[1].operation.variables.name).toBe('Support');
    network.dispose();
  },
);

it.each(['toolbar', 'config'] as const)(
  'Messenger %s clean save closes only its acknowledged active revision',
  async (entry) => {
    const { network } = await startMessengerSave(entry);
    await flushProviderUpdates(() =>
      network.pending[0].resolve({
        integrationsEditMessengerIntegration: { _id: 'integration-a' },
      }),
    );
    await waitFor(() => expect(mockClose).toHaveBeenCalledTimes(1));
    network.dispose();
  },
);
it.each(['toolbar', 'config'] as const)(
  'Messenger %s unchanged remount acknowledges the completed snapshot without leaking it',
  async (entry) => {
    const { network, remount } = await startMessengerSave(entry);
    remount();
    await waitForMessenger(entry);
    await acknowledgeMessenger(network);
    expect(mockClose).not.toHaveBeenCalled();
    serverGreeting = 'Server acknowledged greeting';
    remount();
    expect((screen.getByLabelText('greeting') as HTMLInputElement).value).toBe(
      'Server acknowledged greeting',
    );
    network.dispose();
  },
);

it('Messenger config keeps nested bot edits made during a save immutable across acknowledgement', async () => {
  const { network, remount } = await startMessengerSave('config');
  fireEvent.change(screen.getByLabelText('botSetup.greetingMessage'), {
    target: { value: 'New nested greeting' },
  });
  await acknowledgeMessenger(network);
  expect(mockClose).not.toHaveBeenCalled();
  remount();
  await waitFor(() =>
    expect(
      (screen.getByLabelText('botSetup.greetingMessage') as HTMLTextAreaElement)
        .value,
    ).toBe('New nested greeting'),
  );
  network.dispose();
});
