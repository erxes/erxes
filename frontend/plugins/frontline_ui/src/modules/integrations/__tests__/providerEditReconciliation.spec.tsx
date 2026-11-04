import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import type { PropsWithChildren } from 'react';
import { IntegrationDraftContext } from '../hooks/useIntegrationDraft';
import { DiscordIntegrationEditForm } from '../discord/components/DiscordIntegrationActions';
import { CallIntegrationEdit } from '../call/components/CallIntegrationEdit';

let mockCallDetails = {
  phone: '12345',
  wsServer: 'wss://calls.example.com',
  srcTrunk: 'old-source',
  dstTrunk: 'old-destination',
  queues: [],
  operators: [],
};

let mockIntegration = {
  _id: 'integration-a',
  name: 'Original name',
  brandId: 'original-brand',
  channelId: 'channel-a',
};
const mockEdit = jest.fn();
jest.mock('../hooks/useIntegrationDetail', () => ({
  useIntegrationDetail: () => ({
    integrationDetail: mockIntegration,
    loading: false,
  }),
}));
jest.mock('../hooks/useIntegrationEdit', () => ({
  useIntegrationEdit: () => ({ editIntegration: mockEdit, loading: false }),
}));
jest.mock('../call/hooks/useCallIntegrationDetail', () => ({
  useCallIntegrationDetail: () => ({
    callsIntegrationDetail: mockCallDetails,
    loading: false,
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('react-router-dom', () => ({ useParams: () => ({}) }));
jest.mock('erxes-ui', () => {
  const { createProviderUi } = jest.requireActual<
    typeof import('./fixtures/providerUi')
  >('./fixtures/providerUi');
  return {
    ...createProviderUi(),
    isDefined: (value: unknown) => value !== null && value !== undefined,
  };
});
jest.mock('ui-modules', () => {
  const { BrandInput, Wrap } = jest.requireActual<
    typeof import('./fixtures/providerUi')
  >('./fixtures/providerUi');
  return {
    PanelFormRow: Wrap,
    SelectBrands: { FormItem: BrandInput },
    SelectBrand: BrandInput,
    SelectMember: { FormItem: BrandInput },
    useSidePanel: () => ({ close: jest.fn() }),
    PanelFormLayout: ({ children }: PropsWithChildren) => (
      <>
        {children}
        <button type="submit">Save</button>
      </>
    ),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockIntegration = {
    _id: 'integration-a',
    name: 'Original name',
    brandId: 'original-brand',
    channelId: 'channel-a',
  };
  mockCallDetails = {
    phone: '12345',
    wsServer: 'wss://calls.example.com',
    srcTrunk: 'old-source',
    dstTrunk: 'old-destination',
    queues: [],
    operators: [],
  };
});

it('preserves refreshed call trunks while saving a different field', async () => {
  const store = createStore();
  const editor = () => (
    <Provider store={store}>
      <IntegrationDraftContext.Provider value="call-edit-a">
        <CallIntegrationEdit id="integration-a" />
      </IntegrationDraftContext.Provider>
    </Provider>
  );
  const mounted = render(editor());
  await waitFor(() =>
    expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
      'Original name',
    ),
  );
  fireEvent.change(screen.getByLabelText('brandId'), {
    target: { value: 'edited-brand' },
  });
  mockCallDetails = {
    ...mockCallDetails,
    srcTrunk: 'new-source',
    dstTrunk: 'new-destination',
  };
  mounted.rerender(editor());
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockEdit).toHaveBeenCalled());
  expect(mockEdit.mock.calls[0][0].variables.details).toMatchObject({
    srcTrunk: 'new-source',
    dstTrunk: 'new-destination',
  });
});

it('preserves an inline rename when saving a different dirty provider field', async () => {
  const store = createStore();
  const editor = () => (
    <Provider store={store}>
      <IntegrationDraftContext.Provider value="provider-edit-a">
        <DiscordIntegrationEditForm id="integration-a" setOpen={jest.fn()} />
      </IntegrationDraftContext.Provider>
    </Provider>
  );
  const mounted = render(editor());
  await waitFor(() =>
    expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
      'Original name',
    ),
  );
  fireEvent.change(screen.getByLabelText('brandId'), {
    target: { value: 'edited-brand' },
  });
  mockIntegration = { ...mockIntegration, name: 'Renamed inline' };
  mounted.rerender(editor());
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockEdit).toHaveBeenCalled());
  expect(mockEdit.mock.calls[0][0].variables).toEqual({
    _id: 'integration-a',
    name: 'Renamed inline',
    brandId: 'edited-brand',
    channelId: 'channel-a',
  });
  fireEvent.change(screen.getByLabelText('brandId'), {
    target: { value: 'later-brand' },
  });
  act(() => mockEdit.mock.calls[0][0].onCompleted());
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
    'Renamed inline',
  );
  expect(screen.getByLabelText<HTMLInputElement>('brandId').value).toBe(
    'later-brand',
  );
});
