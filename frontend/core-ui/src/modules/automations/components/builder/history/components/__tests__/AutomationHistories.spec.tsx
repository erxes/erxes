/**
 * @jest-environment-options {"customExportConditions":["browser","require","default"]}
 */
import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { PropsWithChildren } from 'react';
import {
  AutomationHistorySplitDirection,
  AutomationHistoryViewMode,
} from '@/automations/types';
import { useAutomationHistoryView } from '../../hooks/useAutomationHistoryView';
import { AutomationHistories } from '../AutomationHistories';

jest.mock('@/automations/context/AutomationProvider', () => ({
  useAutomation: () => ({ detail: { _id: 'automation-a' } }),
}));
jest.mock('@/automations/hooks/useAutomationHistories', () => ({
  useAutomationHistories: () => ({
    list: [],
    totalCount: 0,
    loading: false,
    refetch: jest.fn(),
    handleFetchMore: jest.fn(),
    hasNextPage: false,
    hasPreviousPage: false,
  }),
}));
jest.mock('@/automations/constants', () => ({
  AUTOMATION_HISTORIES_CURSOR_SESSION_KEY: 'automation-history-test-cursor',
}));
jest.mock('../../AutomationHistoryRecordTableColumns', () => ({
  automationHistoriesColumns: [],
}));
jest.mock('../filters/AutomationRecordTableFilter', () => ({
  AutomationHistoriesRecordTableFilter: () => null,
}));
jest.mock('../AutomationHistoryViewOptions', () => ({
  AutomationHistoryViewModeToggle: () => null,
}));
jest.mock('../AutomationHistorySplitPanel', () => ({
  AutomationHistorySplitPanel: ({ executionId }: { executionId: string }) => (
    <div>Execution detail: {executionId}</div>
  ),
}));
jest.mock('@/automations/components/common/AutomationErrorEmptyState', () => ({
  AutomationErrorEmptyState: () => null,
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const panels = jest.requireActual<typeof import('react-resizable-panels')>(
    'react-resizable-panels',
  );
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const Empty = () => null;
  const Table = Object.assign(
    ({ children }: PropsWithChildren) => <table>{children}</table>,
    {
      Provider: Container,
      CursorProvider: Container,
      Header: Empty,
      Body: ({ children }: PropsWithChildren) => <tbody>{children}</tbody>,
      Row: Empty,
      RowList: Empty,
      RowSkeleton: Empty,
      CursorBackwardSkeleton: Empty,
      CursorForwardSkeleton: Empty,
    },
  );
  return {
    Button: ({ children }: PropsWithChildren) => <button>{children}</button>,
    Label: Container,
    PageSubHeader: Container,
    Skeleton: Empty,
    RecordTable: Table,
    Resizable: {
      PanelGroup: panels.PanelGroup,
      Panel: panels.Panel,
      Handle: () => <panels.PanelResizeHandle />,
    },
  };
});

const renderHistory = () => {
  const store = createStore();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const view = renderHook(useAutomationHistoryView, { wrapper });
  const history = render(<AutomationHistories />, { wrapper });
  return { view: view.result, ...history };
};

describe('automation history split panels', () => {
  beforeEach(() => localStorage.clear());

  it('shows the selected execution in a panel and removes the panel on close', () => {
    const { view, queryByText, getByText, queryByRole } = renderHistory();
    expect(queryByRole('separator')).toBeNull();

    act(() => {
      view.current.changeViewMode(AutomationHistoryViewMode.Split);
      view.current.selectExecution('execution-first');
    });
    expect(getByText('Execution detail: execution-first')).toBeTruthy();
    expect(queryByRole('separator')).not.toBeNull();

    act(() => view.current.selectExecution('execution-second'));
    expect(queryByText('Execution detail: execution-first')).toBeNull();
    expect(getByText('Execution detail: execution-second')).toBeTruthy();

    act(() => view.current.selectExecution(null));
    expect(queryByText('Execution detail: execution-second')).toBeNull();
    expect(queryByRole('separator')).toBeNull();
  });

  it('changes the actual panel layout between top/bottom and left/right', () => {
    const { view, container } = renderHistory();
    act(() => {
      view.current.changeViewMode(AutomationHistoryViewMode.Split);
      view.current.selectExecution('execution-first');
    });
    const group = () =>
      container.querySelector<HTMLElement>('[data-panel-group]');
    expect(group()?.style.flexDirection).toBe('column');

    act(() =>
      view.current.setSplitDirection(
        AutomationHistorySplitDirection.Horizontal,
      ),
    );
    expect(group()?.style.flexDirection).toBe('row');

    act(() =>
      view.current.setSplitDirection(AutomationHistorySplitDirection.Vertical),
    );
    expect(group()?.style.flexDirection).toBe('column');
  });

  it('allows keyboard resizing without collapsing either panel', () => {
    const { view, getByRole } = renderHistory();
    act(() => {
      view.current.changeViewMode(AutomationHistoryViewMode.Split);
      view.current.setSplitDirection(
        AutomationHistorySplitDirection.Horizontal,
      );
      view.current.selectExecution('execution-first');
    });
    const handle = getByRole('separator');
    expect(handle.getAttribute('aria-valuenow')).toBe('60');

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handle.getAttribute('aria-valuenow')).toBe('70');

    fireEvent.keyDown(handle, { key: 'End' });
    expect(handle.getAttribute('aria-valuenow')).toBe('80');

    fireEvent.keyDown(handle, { key: 'Home' });
    expect(handle.getAttribute('aria-valuenow')).toBe('20');
  });
});
