import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { ComponentProps, PropsWithChildren } from 'react';
import { SettingsPanelContext } from '@/settings/contexts/SettingsPanelContext';
import { GET_TICKET_STATUS_BY_TYPE } from '@/status/graphql/query/getTicketStatusByType';
import {
  GET_ACCESSIBLE_TICKET_STATUSES,
  GET_TICKET_STATUS_BY_PIPELINE,
} from '@/status/graphql/query/getTicketStatusesByPipelines';
import { StatusPanelForm } from '../StatusSheet';

beforeAll(() => {
  const cloneValue = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(cloneValue);
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, cloneValue(item)]),
      );
    }
    return value;
  };
  Object.defineProperty(globalThis, 'structuredClone', {
    configurable: true,
    value: cloneValue,
  });
});

const mockToast = jest.fn();
jest.mock('erxes-ui', () => {
  const { Controller, FormProvider } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const { forwardRef } = jest.requireActual<typeof import('react')>('react');
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    Form: Object.assign(FormProvider, {
      Field: Controller,
      Item: Container,
      Label: Container,
      Control: Container,
      Message: () => null,
    }),
    Input: forwardRef<HTMLInputElement, ComponentProps<'input'>>(
      (props, ref) => <input {...props} aria-label={props.name} ref={ref} />,
    ),
    Textarea: forwardRef<HTMLTextAreaElement, ComponentProps<'textarea'>>(
      (props, ref) => <textarea {...props} aria-label={props.name} ref={ref} />,
    ),
    Button: ({
      children,
      type,
      disabled,
      onClick,
    }: ComponentProps<'button'>) => (
      <button type={type} disabled={disabled} onClick={onClick}>
        {children}
      </button>
    ),
    Sheet: { Content: Container },
    ColorPicker: {
      Provider: Container,
      Trigger: Container,
      Content: () => null,
    },
    Spinner: () => null,
    cn: (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' '),
    useToast: () => ({ toast: mockToast }),
    useConfirm: () => ({ confirm: () => Promise.resolve() }),
    isDeeplyEqual:
      jest.requireActual<typeof import('deep-equal')>('deep-equal'),
  };
});
jest.mock('react-router-dom', () => ({ useParams: () => ({}) }));
jest.mock('ui-modules', () => ({ useSidePanel: () => ({}) }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

it('a failed status edit releases its scoped save after Activity so the same draft can retry', async () => {
  const status = {
    _id: 'status-a',
    name: 'Saved status',
    description: 'Saved description',
    color: '#123456',
    pipelineId: 'pipeline-a',
    order: 0,
    type: 1,
    createdAt: null,
    updatedAt: null,
  };
  let attempts = 0;
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          const savedStatus = {
            __typename: 'TicketStatus',
            ...status,
            name: 'Retry status',
            visibilityType: null,
            memberIds: [],
            canMoveMemberIds: [],
            canEditMemberIds: [],
            departmentIds: [],
            state: null,
            probability: null,
          };
          if (operation.operationName === 'UpdateTicketStatus') {
            attempts += 1;
            if (attempts === 1) {
              observer.error(new Error('Status service unavailable'));
              return;
            }
            observer.next({ data: { updateTicketStatus: savedStatus } });
          } else if (operation.operationName === 'GetTicketStatusesByType') {
            observer.next({ data: { getTicketStatusesByType: [savedStatus] } });
          } else if (
            operation.operationName === 'getTicketStatusesChoicesPipeline'
          ) {
            observer.next({ data: { getTicketStatusesChoicesPipeline: [] } });
          } else if (
            operation.operationName === 'getAccessibleTicketStatuses'
          ) {
            observer.next({ data: { getAccessibleTicketStatuses: [] } });
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
  const subscriptions = [
    GET_TICKET_STATUS_BY_TYPE,
    GET_TICKET_STATUS_BY_PIPELINE,
    GET_ACCESSIBLE_TICKET_STATUSES,
  ].map((query) =>
    client
      .watchQuery({
        query,
        variables: { pipelineId: 'pipeline-a', type: 1 },
        fetchPolicy: 'cache-only',
      })
      .subscribe(() => undefined),
  );
  const store = createStore();
  const close = jest.fn();
  const Frame = ({ editing }: { editing: boolean }) => (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <SettingsPanelContext.Provider value={{ pipelineId: 'pipeline-a' }}>
          {editing ? (
            <StatusPanelForm
              editingStatus={status}
              statusType={1}
              onClose={close}
            />
          ) : (
            <p>Activity</p>
          )}
        </SettingsPanelContext.Provider>
      </Provider>
    </ApolloProvider>
  );
  const panel = render(<Frame editing />);
  try {
    fireEvent.change(screen.getByLabelText('name'), {
      target: { value: 'Retry status' },
    });
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Update' })),
    );
    await waitFor(() => expect(attempts).toBe(1));
    expect(close).not.toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' }),
    );
    panel.rerender(<Frame editing={false} />);
    panel.rerender(<Frame editing />);
    expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
      'Retry status',
    );
    expect(screen.getByRole('button', { name: 'Update' })).toMatchObject({
      disabled: false,
    });
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Update' })),
    );
    await waitFor(() => expect(attempts).toBe(2));
    await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  } finally {
    panel.unmount();
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    client.stop();
  }
});
