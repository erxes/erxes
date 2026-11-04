import { act, renderHook } from '@testing-library/react';
import { toast } from 'erxes-ui';
import { useIntegrationAdd } from '../hooks/useIntegrationAdd';
import { useIntegrationEdit } from '../hooks/useIntegrationEdit';

type Result = {
  integrationsCreateExternalIntegration?: { _id: string } | null;
  integrationsEditCommonFields?: { _id: string } | null;
};
type Options = { onCompleted?: (data: Result) => void };
const mockData: Result = {};
jest.mock('@apollo/client', () => ({
  useMutation: (_document: unknown, hookOptions: Options = {}) => [
    (options: Options) => {
      (options.onCompleted ?? hookOptions.onCompleted)?.(mockData);
      return Promise.resolve({ data: mockData });
    },
    { loading: false },
  ],
}));
jest.mock('erxes-ui', () => ({ toast: jest.fn() }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

beforeEach(() => jest.clearAllMocks());
it('an empty resolved integration create does not announce success', async () => {
  const { result } = renderHook(() => useIntegrationAdd());
  await act(async () => {
    await result.current.addIntegration({
      variables: {
        name: 'Inbox',
        kind: 'mail',
        channelId: 'channel',
        brandId: 'brand',
      },
    });
  });
  expect(toast).not.toHaveBeenCalledWith(
    expect.objectContaining({ variant: 'default' }),
  );
});
it('an empty integration edit response retains the provider form instead of completing it', () => {
  const completed = jest.fn();
  const { result } = renderHook(() => useIntegrationEdit());
  act(() =>
    result.current.editIntegration({
      variables: { _id: 'integration', name: 'Edited', channelId: 'channel' },
      onCompleted: completed,
    }),
  );
  expect(completed).not.toHaveBeenCalled();
  expect(toast).toHaveBeenCalledWith(
    expect.objectContaining({ variant: 'destructive' }),
  );
});
