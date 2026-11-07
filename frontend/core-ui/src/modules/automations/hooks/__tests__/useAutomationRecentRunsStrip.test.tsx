/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type PropsWithChildren } from 'react';
import { useAutomationRecentRunsStrip } from '../useAutomationRecentRunsStrip';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
jest.mock('../useAutomationRunLabels', () => ({
  useAutomationRunLabels: () => ({
    statusLabel: jest.fn(),
    actionLabel: jest.fn(),
  }),
}));

it('opens a recent run with its execution identity encoded in the history URL', () => {
  const store = createStore();
  const { result } = renderHook(
    () => useAutomationRecentRunsStrip('automation-1'),
    {
      wrapper: ({ children }: PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      ),
    },
  );
  act(() => result.current.openRun('execution-1'));
  const target = new URL(mockNavigate.mock.calls[0][0], 'https://example.test');
  expect(target.pathname).toBe('/automations/edit/automation-1');
  expect(target.searchParams.get('activeTab')).toBe('history');
  expect(target.searchParams.get('executionId')).toBe('execution-1');
  expect(target.searchParams.get('panel')).toMatch(/^\/module\//);
});
