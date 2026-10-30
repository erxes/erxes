import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';
import { useStageDetail } from 'ui-modules';
import { AccountingCheckSyncedDealRuleFilterView } from '../AccountingCheckSyncedDealRuleSelect';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@apollo/client', () => ({ useQuery: jest.fn() }));
jest.mock('ui-modules', () => ({ useStageDetail: jest.fn() }));
jest.mock('../../graphql/checkSyncedDeals', () => ({
  ACCOUNTING_SYNC_DEAL_RULES_QUERY: {},
}));
jest.mock('erxes-ui', () => {
  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    useMultiQueryState: jest.fn(),
    useFilterContext: () => ({ resetFilterState: jest.fn() }),
    Combobox: { Check: () => null },
    Filter: { View: Wrapper },
    Command: Object.assign(Wrapper, {
      Input: () => null,
      Empty: () => null,
      List: Wrapper,
      Item: ({
        children,
        onSelect,
      }: {
        children?: ReactNode;
        onSelect: () => void;
      }) => <button onClick={onSelect}>{children}</button>,
    }),
  };
});

const stageNames: Record<string, string> = { 'stage-won': 'Won deals' };
const setQueries = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useQuery).mockReturnValue({
    loading: false,
    data: {
      saleRules: [
        {
          _id: 'rule-titled',
          code: 'syncDeal',
          subId: 'stage-won',
          value: { title: 'Retail sales', stageId: 'stage-won' },
        },
        {
          _id: 'wdGCmGjIHV522inFMWcOk',
          code: 'syncDeal',
          subId: 'stage-won',
          value: {},
        },
      ],
      returnRules: [
        {
          _id: 'HIqEdNPq_sYe9k94uY6gH',
          code: 'syncDealReturn',
          subId: '',
          value: { returnType: 'onlySale' },
        },
      ],
      movementRules: [],
    },
  } as unknown as ReturnType<typeof useQuery>);
  jest.mocked(useStageDetail).mockImplementation((options) => ({
    stageDetail: {
      name: stageNames[options?.variables?._id ?? ''],
    } as ReturnType<typeof useStageDetail>['stageDetail'],
    loading: false,
    error: undefined,
  }));
  jest
    .mocked(useMultiQueryState)
    .mockReturnValue([
      { ruleId: null, boardId: null, pipelineId: null, stageId: null },
      setQueries,
    ]);
});

test('untitled deal rules show their stage name, rules without a stage show a neutral label, never the id', () => {
  render(<AccountingCheckSyncedDealRuleFilterView />);

  expect(screen.getByText('Retail sales')).toBeTruthy();
  expect(screen.getByText('Won deals')).toBeTruthy();
  expect(screen.getByText('untitled-rule')).toBeTruthy();
  expect(screen.queryByText('wdGCmGjIHV522inFMWcOk')).toBeNull();
  expect(screen.queryByText('HIqEdNPq_sYe9k94uY6gH')).toBeNull();
  expect(screen.queryByText('stage-won')).toBeNull();
});

test('picking an untitled rule still filters deals by its stage', () => {
  render(<AccountingCheckSyncedDealRuleFilterView />);

  fireEvent.click(screen.getByText('Won deals'));

  expect(setQueries).toHaveBeenCalledWith({
    ruleId: 'wdGCmGjIHV522inFMWcOk',
    boardId: null,
    pipelineId: null,
    stageId: 'stage-won',
  });
});
