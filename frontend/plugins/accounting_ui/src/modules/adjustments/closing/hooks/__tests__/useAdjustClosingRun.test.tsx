import type { ReactNode } from 'react';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { useAdjustClosingRun } from '@/adjustments/closing/hooks/useAdjustClosingRun';
import { ADJUST_CLOSING_CALCULATE } from '@/adjustments/closing/graphql/adjustClosingRun';
import { ADJUST_CLOSING_DETAIL_QUERY } from '@/adjustments/closing/graphql/adjustClosingDetail';

const mockToast = jest.fn();

jest.mock('react-i18next', () => {
  const mongolian: Record<string, string> = jest.requireActual(
    '../../../../../../../../../backend/gateway/src/locales/mn/accounting.json',
  );
  return {
    useTranslation: () => ({
      t: (key: string) => mongolian[key] ?? key,
    }),
  };
});
jest.mock(
  'erxes-ui',
  () => ({ toast: (...args: unknown[]) => mockToast(...args) }),
  {
    virtual: true,
  },
);

const closingId = 'closing-2026-06';

const detailRefetch: MockedResponse = {
  request: {
    query: ADJUST_CLOSING_DETAIL_QUERY,
    variables: { _id: closingId },
  },
  result: { data: { adjustClosingDetail: null } },
};

const calculate = (result: MockedResponse['result']): MockedResponse => ({
  request: { query: ADJUST_CLOSING_CALCULATE, variables: { _id: closingId } },
  result,
});

const renderRun = (mocks: MockedResponse[]) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
  return renderHook(() => useAdjustClosingRun(closingId), { wrapper });
};

const pressCalculate = async (mocks: MockedResponse[]) => {
  const { result } = renderRun(mocks);
  await act(async () => {
    await result.current.calculateAdjust().catch(() => undefined);
  });
  await waitFor(() => expect(mockToast).toHaveBeenCalled());
  return mockToast.mock.calls[0][0];
};

beforeEach(() => mockToast.mockClear());

describe('calculating a closing adjustment in Mongolian', () => {
  it('tells the accountant in Mongolian that only the newest closing can be calculated', async () => {
    const toast = await pressCalculate([
      calculate({
        errors: [
          new GraphQLError('Only the latest Adjust Closing can be edited'),
        ],
      }),
    ]);

    expect(toast).toMatchObject({
      title: 'Алдаа',
      variant: 'destructive',
      description:
        'Зөвхөн хамгийн сүүлд үүсгэсэн хаалтын тохируулгыг засах, тооцоолох боломжтой',
    });
  });

  it('explains in Mongolian that a published closing cannot be recalculated', async () => {
    const toast = await pressCalculate([
      calculate({
        errors: [
          new GraphQLError('Published Adjust Closing cannot be calculated'),
        ],
      }),
    ]);

    expect(toast.description).toBe(
      'Баталгаажсан хаалтын тохируулгыг тооцоолох боломжгүй',
    );
  });

  it('still shows an unexpected server error as it was sent', async () => {
    const toast = await pressCalculate([
      calculate({ errors: [new GraphQLError('Mongo connection timed out')] }),
    ]);

    expect(toast.description).toBe('Mongo connection timed out');
  });

  it('confirms a successful calculation in Mongolian', async () => {
    const toast = await pressCalculate([
      calculate({
        data: {
          adjustClosingCalculate: {
            _id: closingId,
            status: 'process',
            beginDate: '2026-01-01T00:00:00.000Z',
            successDate: null,
            checkedAt: '2026-11-16T08:00:00.000Z',
            error: null,
            warning: null,
            taxImpactValue: 0,
            closePeriodTrId: null,
            earningTrId: null,
            taxPayableTrId: null,
          },
        },
      }),
      detailRefetch,
    ]);

    expect(toast).toMatchObject({
      title: 'Амжилттай',
      description: 'Хаалтын тохируулга амжилттай тооцоологдлоо',
    });
  });
});
