/** @jest-environment jsdom */
import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import {
  AutomationExecutionDetailProvider,
  useAutomationExecutionDetail,
} from '../AutomationExecutionDetailContext';
import { GET_AUTOMATION_EXECUTION_DETAIL } from '../../graphql/automationExecutionQueries';

let mockCanGoBack = false;
jest.mock('../AutomationHistoryDetailContext', () => ({
  useAutomationHistoryDetail: () => ({
    executionId: 'selected-execution',
    canGoBack: mockCanGoBack,
  }),
}));

const renderExecution = (executionAutomationId: string) =>
  renderHook(() => useAutomationExecutionDetail(), {
    wrapper: ({ children }: PropsWithChildren) => (
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_AUTOMATION_EXECUTION_DETAIL,
              variables: { executionId: 'selected-execution' },
            },
            result: {
              data: {
                getAutomationExecutionDetail: {
                  _id: 'selected-execution',
                  automationId: executionAutomationId,
                  createdAt: '2026-11-05T00:00:00Z',
                  modifiedAt: null,
                  triggerId: 'trigger',
                  triggerType: 'core:customer',
                  triggerConfig: {},
                  nextActionId: null,
                  targetId: 'customer',
                  target: {},
                  status: 'complete',
                  description: 'Execution from a history URL',
                  actions: [],
                  startWaitingDate: null,
                  waitingActionId: null,
                },
              },
            },
          },
        ]}
      >
        <AutomationExecutionDetailProvider automationId="current-automation">
          {children}
        </AutomationExecutionDetailProvider>
      </MockedProvider>
    ),
  });

beforeEach(() => {
  mockCanGoBack = false;
});

it('loads a deep-linked execution belonging to the current automation', async () => {
  const { result } = renderExecution('current-automation');

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.executionDetail?._id).toBe('selected-execution');
  expect(result.current.error).toBeUndefined();
});

it('keeps another automation’s execution out of the selected history', async () => {
  const { result } = renderExecution('other-automation');

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.executionDetail).toBeUndefined();
  expect(result.current.error?.message).toBe(
    'This execution does not belong to this automation.',
  );
});

it('allows drilling into a workflow child owned by another automation', async () => {
  mockCanGoBack = true;
  const { result } = renderExecution('workflow-automation');

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.executionDetail?.automationId).toBe(
    'workflow-automation',
  );
  expect(result.current.error).toBeUndefined();
});
