import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { PropsWithChildren } from 'react';
import {
  AutomationHistorySplitDirection,
  AutomationHistoryViewMode,
} from '@/automations/types';
import {
  useAutomationHistoryView,
  useSelectExecutionCellProps,
} from '../useAutomationHistoryView';

let mockAutomationId = 'automation-a';

jest.mock('@/automations/context/AutomationProvider', () => ({
  useAutomation: () => ({ detail: { _id: mockAutomationId } }),
}));

const createWrapper = () => {
  const store = createStore();
  return ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('automation history view', () => {
  beforeEach(() => {
    localStorage.clear();
    mockAutomationId = 'automation-a';
  });

  it('starts in sheet mode with a top/bottom split preference', () => {
    const { result } = renderHook(useAutomationHistoryView, {
      wrapper: createWrapper(),
    });

    expect(result.current.isSplitView).toBe(false);
    expect(result.current.isVerticalSplit).toBe(true);
    expect(result.current.selectedExecutionId).toBeNull();
  });

  it('keeps the selected execution when switching layout and clears it on close', () => {
    const { result } = renderHook(useAutomationHistoryView, {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.changeViewMode(AutomationHistoryViewMode.Split);
      result.current.selectExecution('execution-first');
    });
    expect(result.current.isSplitView).toBe(true);
    expect(result.current.selectedExecutionId).toBe('execution-first');

    act(() => {
      result.current.setSplitDirection(
        AutomationHistorySplitDirection.Horizontal,
      );
      result.current.selectExecution('execution-second');
    });
    expect(result.current.isVerticalSplit).toBe(false);
    expect(result.current.selectedExecutionId).toBe('execution-second');

    act(() => result.current.changeViewMode(AutomationHistoryViewMode.Sheet));
    expect(result.current.isSplitView).toBe(false);
    expect(result.current.selectedExecutionId).toBe('execution-second');

    act(() => result.current.selectExecution(null));
    expect(result.current.selectedExecutionId).toBeNull();
  });

  it("does not show another automation's selected execution after navigation", () => {
    const { result, rerender } = renderHook(useAutomationHistoryView, {
      wrapper: createWrapper(),
    });
    act(() => result.current.selectExecution('execution-a'));

    mockAutomationId = 'automation-b';
    rerender();
    expect(result.current.selectedExecutionId).toBeNull();

    act(() => result.current.selectExecution('execution-b'));
    expect(result.current.selectedExecutionId).toBe('execution-b');

    mockAutomationId = 'automation-a';
    rerender();
    expect(result.current.selectedExecutionId).toBeNull();
  });

  it('restores layout preferences without restoring a stale execution', () => {
    const first = renderHook(useAutomationHistoryView, {
      wrapper: createWrapper(),
    });
    act(() => {
      first.result.current.changeViewMode(AutomationHistoryViewMode.Split);
      first.result.current.setSplitDirection(
        AutomationHistorySplitDirection.Horizontal,
      );
      first.result.current.selectExecution('previous-session-execution');
    });
    first.unmount();

    const restored = renderHook(useAutomationHistoryView, {
      wrapper: createWrapper(),
    });
    expect(restored.result.current.isSplitView).toBe(true);
    expect(restored.result.current.isVerticalSplit).toBe(false);
    expect(restored.result.current.selectedExecutionId).toBeNull();
  });

  it('opens an execution from a plain cell only in split mode', () => {
    const { result } = renderHook(
      () => ({
        view: useAutomationHistoryView(),
        cell: useSelectExecutionCellProps('clicked-execution'),
      }),
      { wrapper: createWrapper() },
    );
    expect(result.current.cell.onClick).toBeUndefined();

    act(() =>
      result.current.view.changeViewMode(AutomationHistoryViewMode.Split),
    );
    act(() => result.current.cell.onClick?.());
    expect(result.current.view.selectedExecutionId).toBe('clicked-execution');

    act(() =>
      result.current.view.changeViewMode(AutomationHistoryViewMode.Sheet),
    );
    expect(result.current.cell.onClick).toBeUndefined();
  });
});
