import { act, renderHook } from '@testing-library/react';
import { useDealSearch } from '@/deals/hooks/useDealSearch';
import { useCommonDealSearch } from '../useCommonDealSearch';

jest.mock('@/deals/hooks/useDealSearch', () => ({
  useDealSearch: jest.fn(),
}));
jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: false }),
}));
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }));

const mockUseDealSearch = jest.mocked(useDealSearch);

const setupSearch = () => renderHook(() => useCommonDealSearch());

const settleSearch = () => {
  act(() => jest.advanceTimersByTime(350));
};

describe('useCommonDealSearch modes', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockUseDealSearch.mockReturnValue({
      deals: [],
      totalCount: 0,
      loading: false,
      loadingMore: false,
      pageInfo: undefined,
      loadMore: jest.fn(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('searches by number without a previous name criterion', () => {
    const { result } = setupSearch();
    act(() => result.current.setActiveSearch('zzqxnomatch'));
    settleSearch();

    act(() => result.current.setCategory('number'));

    expect(result.current.resultsReady).toBe(false);
    expect(mockUseDealSearch).toHaveBeenLastCalledWith(
      '',
      'newest',
      undefined,
      undefined,
    );

    act(() => result.current.setActiveSearch('#2026/1372'));
    settleSearch();

    expect(mockUseDealSearch).toHaveBeenLastCalledWith(
      '',
      'newest',
      undefined,
      '2026/1372',
    );
    expect(result.current.resultsReady).toBe(true);
  });

  it('searches by name without a previous number criterion', () => {
    const { result } = setupSearch();
    act(() => result.current.setCategory('number'));
    act(() => result.current.setActiveSearch('1372'));
    settleSearch();
    act(() => result.current.setCategory('name'));
    act(() => result.current.setActiveSearch('Existing deal'));
    settleSearch();

    expect(mockUseDealSearch).toHaveBeenLastCalledWith(
      'Existing deal',
      'newest',
      undefined,
      undefined,
    );
  });

  it.each(['name', 'number'] as const)(
    'ignores a stored date range in %s mode',
    (category) => {
      const { result } = setupSearch();
      const dateRange = {
        from: new Date(2026, 10, 1),
        to: new Date(2026, 10, 17),
      };
      act(() => {
        result.current.setCategory('date');
        result.current.setDateRange(dateRange);
      });
      expect(mockUseDealSearch).toHaveBeenLastCalledWith(
        '',
        'newest',
        dateRange,
        undefined,
      );

      act(() => result.current.setCategory(category));
      expect(result.current.resultsReady).toBe(false);
      act(() => result.current.setActiveSearch('1372'));
      settleSearch();

      expect(mockUseDealSearch).toHaveBeenLastCalledWith(
        category === 'name' ? '1372' : '',
        'newest',
        undefined,
        category === 'number' ? '1372' : undefined,
      );
    },
  );

  it('does not wait for an inactive text debounce when switching to date', () => {
    const { result } = setupSearch();
    act(() => result.current.setActiveSearch('still typing'));
    const dateRange = { from: new Date(2026, 10, 1) };
    act(() => {
      result.current.setCategory('date');
      result.current.setDateRange(dateRange);
    });

    expect(result.current.searchSettled).toBe(true);
    expect(result.current.resultsReady).toBe(true);
    settleSearch();
    expect(mockUseDealSearch).toHaveBeenLastCalledWith(
      '',
      'newest',
      dateRange,
      undefined,
    );
  });
});
