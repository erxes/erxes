import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
  useQuery,
} from '@apollo/client';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { ComponentProps, PropsWithChildren } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'erxes-ui';
import { CALL_PRO_INTEGRATION_DETAIL } from '../callpro/graphql/queries/callProQueries';
import {
  createIntegrationFormDraft,
  IntegrationDraftContext,
} from '../hooks/useIntegrationDraft';
import { useIntegrationEdit } from '../hooks/useIntegrationEdit';
import type { DocumentNode } from 'graphql';
import { GET_CHANNEL_INTEGRATIONS_PEEK } from '@/channels/graphql/queries';
import { GET_INTEGRATIONS_BY_KIND } from '../graphql/queries/getIntegrations';
import { GET_INTEGRATION_DETAIL } from '../graphql/queries/getIntegrationDetail';
import { CallIntegrationEdit } from '../call/components/CallIntegrationEdit';
import { CallProIntegrationEdit } from '../callpro/components/CallProIntegrationEdit';
import { CALL_INTEGRATION_DETAIL } from '../call/graphql/queries/callConfigQueries';

const mockToast = jest.mocked(toast);
let mockActivePanel = 'integration-a';
const mockClose = jest.fn(() => {
  mockActivePanel = 'closed';
});
jest.mock('erxes-ui', () => {
  const { createProviderUi, Wrap } = jest.requireActual<
    typeof import('./fixtures/providerUi')
  >('./fixtures/providerUi');
  const toast = jest.fn();
  const { forwardRef } = jest.requireActual<typeof import('react')>('react');
  return {
    ...createProviderUi(),
    Input: forwardRef<HTMLInputElement, ComponentProps<'input'>>(
      (props, ref) => (
        <input
          {...props}
          {...('value' in props ? { value: props.value ?? '' } : {})}
          ref={ref}
          aria-label={props.name}
        />
      ),
    ),
    toast,
    useToast: () => ({ toast }),
    isDefined: (value: unknown) => value != null,
    Alert: Object.assign(Wrap, { Title: Wrap, Description: Wrap }),
    isDeeplyEqual:
      jest.requireActual<typeof import('deep-equal')>('deep-equal'),
  };
});
jest.mock('ui-modules', () => {
  const { BrandInput, Wrap } = jest.requireActual<
    typeof import('./fixtures/providerUi')
  >('./fixtures/providerUi');
  return {
    useSidePanel: () => ({ close: mockClose }),
    PanelFormRow: Wrap,
    PANEL_INPUT_CLASS_NAME: '',
    SelectBrand: BrandInput,
    SelectMember: { FormItem: () => null },
    PanelFormLayout: ({
      children,
      saving,
    }: PropsWithChildren<{ saving?: boolean }>) => (
      <div>
        {children}
        <button type="submit" disabled={saving}>
          Save
        </button>
      </div>
    ),
  };
});
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

type ProviderValues = { phoneNumber: string; recordUrl: string };
const useDraft = createIntegrationFormDraft<ProviderValues>();

it.each(['array', 'function'] as const)(
  'refreshes provider details before acknowledgment and a later save (%s refetch)',
  async (refetchMode) => {
    let server: ProviderValues = {
      phoneNumber: '100',
      recordUrl: 'https://records.example/initial',
    };
    const submitted: ProviderValues[] = [];
    const pendingRefetches: (() => void)[] = [];
    const acknowledgments: (string | null | undefined)[] = [];
    let detailReads = 0;
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            if (operation.operationName === 'callProIntegrationDetail') {
              const complete = () => {
                observer.next({
                  data: {
                    callProIntegrationDetail: {
                      __typename: 'CallProIntegrationDetail',
                      ...server,
                    },
                  },
                });
                observer.complete();
              };
              detailReads += 1;
              if (detailReads === 1) complete();
              else pendingRefetches.push(complete);
              return;
            }
            if (operation.operationName === 'IntegrationsEditCommonFields') {
              const details: unknown = operation.variables.details;
              if (
                !details ||
                typeof details !== 'object' ||
                !('phoneNumber' in details) ||
                typeof details.phoneNumber !== 'string' ||
                !('recordUrl' in details) ||
                typeof details.recordUrl !== 'string'
              ) {
                observer.error(new Error('Missing provider detail payload'));
                return;
              }
              server = {
                phoneNumber: details.phoneNumber,
                recordUrl: details.recordUrl,
              };
              submitted.push({ ...server });
              observer.next({
                data: {
                  integrationsEditCommonFields: {
                    __typename: 'Integration',
                    _id: 'integration-a',
                  },
                },
              });
              observer.complete();
              return;
            }
            observer.next({
              data: {
                integrationDetail: null,
                integrations: {
                  list: [],
                  totalCount: 0,
                  pageInfo: {
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startCursor: null,
                    endCursor: null,
                  },
                },
              },
            });
            observer.complete();
          }),
      ),
    });
    const watchedQueries: {
      query: DocumentNode;
      variables: Record<string, string>;
    }[] = [
      {
        query: GET_INTEGRATIONS_BY_KIND,
        variables: { channelId: 'channel-a' },
      },
      { query: GET_INTEGRATION_DETAIL, variables: { id: 'integration-a' } },
      {
        query: GET_CHANNEL_INTEGRATIONS_PEEK,
        variables: { channelId: 'channel-a' },
      },
    ];
    const subscriptions = watchedQueries.map(({ query, variables }) =>
      client
        .watchQuery({
          query,
          variables,
          fetchPolicy: 'cache-only',
        })
        .subscribe(() => undefined),
    );
    const store = createStore();
    const wrapper = ({ children }: PropsWithChildren) => (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <IntegrationDraftContext.Provider value="user-a:integration-a:callpro">
            {children}
          </IntegrationDraftContext.Provider>
        </Provider>
      </ApolloProvider>
    );
    const editor = renderHook(
      () => {
        const { data } = useQuery(CALL_PRO_INTEGRATION_DETAIL, {
          variables: { integrationId: 'integration-a' },
        });
        const form = useForm<ProviderValues>({
          defaultValues: { phoneNumber: '', recordUrl: '' },
        });
        const draft = useDraft(form, {
          phoneNumber: data?.callProIntegrationDetail?.phoneNumber ?? '',
          recordUrl: data?.callProIntegrationDetail?.recordUrl ?? '',
        });
        const { editIntegration, loading } = useIntegrationEdit();
        const save = () => {
          const snapshot = { ...form.getValues() };
          const values = draft.getSaveValues(snapshot);
          editIntegration({
            variables: {
              _id: 'integration-a',
              name: 'Call Pro line',
              channelId: 'channel-a',
              details: values,
            },
            refetchQueries:
              refetchMode === 'array'
                ? ['callProIntegrationDetail']
                : () => ['callProIntegrationDetail'],
            onCompleted: () => {
              acknowledgments.push(
                client.readQuery({
                  query: CALL_PRO_INTEGRATION_DETAIL,
                  variables: { integrationId: 'integration-a' },
                })?.callProIntegrationDetail?.phoneNumber,
              );
              draft.markSaved(values, snapshot);
            },
          });
        };
        return { form, save, loading };
      },
      { wrapper },
    );
    try {
      await waitFor(() =>
        expect(editor.result.current.form.getValues('phoneNumber')).toBe('100'),
      );
      await act(async () => {
        editor.result.current.form.setValue('phoneNumber', '200', {
          shouldDirty: true,
        });
        editor.result.current.save();
      });
      expect(submitted).toHaveLength(1);
      expect(acknowledgments).toHaveLength(0);
      expect(pendingRefetches).toHaveLength(1);
      expect(editor.result.current.loading).toBe(true);
      act(() => {
        editor.result.current.form.setValue(
          'recordUrl',
          'https://records.example/newer',
          { shouldDirty: true },
        );
      });
      await act(async () => pendingRefetches.shift()?.());
      await waitFor(() => expect(acknowledgments).toEqual(['200']));
      expect(editor.result.current.form.getValues()).toEqual({
        phoneNumber: '200',
        recordUrl: 'https://records.example/newer',
      });
      await act(async () => editor.result.current.save());
      expect(submitted[1]).toEqual({
        phoneNumber: '200',
        recordUrl: 'https://records.example/newer',
      });
      await act(async () => pendingRefetches.shift()?.());
      await waitFor(() => expect(acknowledgments).toEqual(['200', '200']));
    } finally {
      editor.unmount();
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      client.stop();
    }
  },
);

it.each(['call', 'callpro'] as const)(
  '%s refreshes the inactive saved record before reopening without closing B',
  async (provider) => {
    mockToast.mockClear();
    mockClose.mockClear();
    const server = new Map<string, Record<string, unknown>>([
      [
        'integration-a',
        provider === 'callpro'
          ? { phoneNumber: '100', recordUrl: 'https://records.example/initial' }
          : {
              _id: 'call-a',
              inboxId: 'integration-a',
              phone: '100',
              wsServer: 'wss://calls.example',
              srcTrunk: 'src-old',
              dstTrunk: 'dst-old',
              queues: ['old'],
              operators: [],
            },
      ],
      [
        'integration-b',
        provider === 'callpro'
          ? { phoneNumber: '300', recordUrl: 'https://records.example/b' }
          : {
              _id: 'call-b',
              inboxId: 'integration-b',
              phone: '300',
              wsServer: 'wss://calls.example',
              srcTrunk: 'src-b',
              dstTrunk: 'dst-b',
              queues: ['b'],
              operators: [],
            },
      ],
    ]);
    const pending: (() => void)[] = [];
    const submitted: Record<string, unknown>[] = [];
    const Editor =
      provider === 'call' ? CallIntegrationEdit : CallProIntegrationEdit;
    const phoneField = provider === 'call' ? 'phone' : 'phoneNumber';
    const integration = (id: string) => ({
      __typename: 'Integration',
      _id: id,
      kind: provider,
      name: `Line ${id}`,
      languageCode: null,
      code: null,
      tagIds: [],
      createdAt: null,
      leadData: null,
      messengerData: null,
      uiOptions: null,
      isConnected: true,
      channelId: 'channel-a',
      channel: { __typename: 'Channel', _id: 'channel-a', name: 'Channel A' },
      brandId: 'brand-a',
      departmentIds: [],
      details: null,
      facebookPage: [],
      instagramPage: [],
      callData: null,
      isActive: true,
      healthStatus: null,
    });
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            if (operation.operationName === 'IntegrationsEditCommonFields') {
              const details: unknown = operation.variables.details;
              const id: unknown = operation.variables._id;
              if (
                !details ||
                typeof details !== 'object' ||
                typeof id !== 'string'
              ) {
                observer.error(new Error('Missing saved integration details'));
                return;
              }
              const snapshot = Object.fromEntries(Object.entries(details));
              submitted.push(snapshot);
              pending.push(() => {
                server.set(id, { ...server.get(id), ...snapshot });
                observer.next({
                  data: {
                    integrationsEditCommonFields: {
                      __typename: 'Integration',
                      _id: id,
                    },
                  },
                });
                observer.complete();
              });
              return;
            }
            if (
              operation.operationName === 'callProIntegrationDetail' ||
              operation.operationName === 'callsIntegrationDetail'
            ) {
              const id: unknown = operation.variables.integrationId;
              if (typeof id !== 'string' || !server.has(id)) {
                observer.error(
                  new Error('Unexpected provider detail identity'),
                );
                return;
              }
              observer.next({
                data: {
                  [operation.operationName]: {
                    __typename:
                      provider === 'callpro'
                        ? 'CallProIntegrationDetail'
                        : 'CallsIntegrationDetailResponse',
                    ...server.get(id),
                  },
                },
              });
            } else if (operation.operationName === 'IntegrationDetail') {
              const id: unknown = operation.variables.id;
              if (typeof id !== 'string') {
                observer.error(new Error('Unexpected integration identity'));
                return;
              }
              observer.next({ data: { integrationDetail: integration(id) } });
            } else if (operation.operationName === 'callProConfig') {
              observer.next({
                data: {
                  callProConfig: {
                    __typename: 'CallProConfig',
                    enabled: true,
                    webhookUrl: null,
                  },
                },
              });
            } else if (
              operation.operationName === 'Integrations' ||
              operation.operationName === 'ChannelIntegrationsPeek'
            ) {
              observer.next({
                data: {
                  integrations: {
                    list: [],
                    totalCount: 0,
                    pageInfo: {
                      hasNextPage: false,
                      hasPreviousPage: false,
                      startCursor: null,
                      endCursor: null,
                    },
                  },
                },
              });
            } else {
              observer.error(
                new Error(`Unexpected operation: ${operation.operationName}`),
              );
              return;
            }
            observer.complete();
          }),
      ),
    });
    const watched: {
      query: DocumentNode;
      variables: Record<string, string>;
    }[] = [
      {
        query: GET_INTEGRATIONS_BY_KIND,
        variables: { channelId: 'channel-a' },
      },
      { query: GET_INTEGRATION_DETAIL, variables: { id: 'integration-a' } },
      {
        query: GET_CHANNEL_INTEGRATIONS_PEEK,
        variables: { channelId: 'channel-a' },
      },
    ];
    const subscriptions = watched.map(({ query, variables }) =>
      client
        .watchQuery({ query, variables, fetchPolicy: 'cache-only' })
        .subscribe(() => undefined),
    );
    const store = createStore();
    const Frame = ({ id }: { id: string }) => (
      <ApolloProvider client={client}>
        <Provider store={store}>
          <IntegrationDraftContext.Provider value={`user-a:${id}:${provider}`}>
            <Editor key={id} id={id} />
          </IntegrationDraftContext.Provider>
        </Provider>
      </ApolloProvider>
    );
    mockActivePanel = 'integration-a';
    const mounted = render(<Frame id="integration-a" />);
    try {
      await waitFor(() =>
        expect(screen.getByLabelText<HTMLInputElement>(phoneField).value).toBe(
          '100',
        ),
      );
      fireEvent.change(screen.getByLabelText(phoneField), {
        target: { value: '200' },
      });
      if (provider === 'call') {
        fireEvent.change(screen.getByLabelText('srcTrunk'), {
          target: { value: 'src-saved' },
        });
        fireEvent.change(screen.getByLabelText('dstTrunk'), {
          target: { value: 'dst-saved' },
        });
      }
      await act(async () =>
        fireEvent.click(screen.getByRole('button', { name: 'Save' })),
      );
      await waitFor(() => expect(submitted).toHaveLength(1));
      mockActivePanel = 'integration-b';
      mounted.rerender(<Frame id="integration-b" />);
      await waitFor(() =>
        expect(screen.getByLabelText<HTMLInputElement>(phoneField).value).toBe(
          '300',
        ),
      );
      await act(async () => pending.shift()?.());
      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'integration-updated' }),
        ),
      );
      expect(mockClose).not.toHaveBeenCalled();
      expect(mockActivePanel).toBe('integration-b');
      await waitFor(() =>
        expect(screen.getByLabelText<HTMLInputElement>(phoneField).value).toBe(
          '300',
        ),
      );
      const query: DocumentNode =
        provider === 'call'
          ? CALL_INTEGRATION_DETAIL
          : CALL_PRO_INTEGRATION_DETAIL;
      const cached: Record<string, unknown> | null = client.readQuery({
        query,
        variables: { integrationId: 'integration-a' },
      });
      const detail: unknown =
        cached?.[
          provider === 'call'
            ? 'callsIntegrationDetail'
            : 'callProIntegrationDetail'
        ];
      expect(detail).toEqual(expect.objectContaining({ [phoneField]: '200' }));
      mockActivePanel = 'integration-a';
      mounted.rerender(<Frame id="integration-a" />);
      await waitFor(() =>
        expect(screen.getByLabelText<HTMLInputElement>(phoneField).value).toBe(
          '200',
        ),
      );
      const nextField = provider === 'call' ? 'queues' : 'recordUrl';
      fireEvent.change(screen.getByLabelText(nextField), {
        target: {
          value:
            provider === 'call' ? 'later' : 'https://records.example/later',
        },
      });
      await act(async () =>
        fireEvent.click(screen.getByRole('button', { name: 'Save' })),
      );
      await waitFor(() => expect(submitted).toHaveLength(2));
      expect(submitted[1]).toEqual(
        expect.objectContaining({ [phoneField]: '200' }),
      );
      if (provider === 'call')
        expect(submitted[1]).toEqual(
          expect.objectContaining({
            srcTrunk: 'src-saved',
            dstTrunk: 'dst-saved',
            queues: ['later'],
          }),
        );
      else expect(submitted[1].recordUrl).toBe('https://records.example/later');
      await act(async () => pending.shift()?.());
    } finally {
      mounted.unmount();
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      client.stop();
    }
  },
);
