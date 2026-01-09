import { atom, WritableAtom } from 'jotai';
import { ResponsesChartType } from './types';

export const reportChartTypeState = atom<Record<string, ResponsesChartType>>({});

export const reportDateFilterState = atom<Record<string, string>>({});

export const reportSourceFilterState = atom<Record<string, string>>({});

const chartTypeAtomCache = new Map<
  string,
  WritableAtom<ResponsesChartType, [ResponsesChartType], void>
>();

const dateFilterAtomCache = new Map<string, WritableAtom<string, [string], void>>();

const sourceFilterAtomCache = new Map<string, WritableAtom<string, [string], void>>();

export const getReportChartTypeAtom = (cardId: string) => {
  if (!chartTypeAtomCache.has(cardId)) {
    chartTypeAtomCache.set(
      cardId,
      atom(
        (get) => get(reportChartTypeState)[cardId] || ResponsesChartType.Bar,
        (get, set, newValue: ResponsesChartType) => {
          set(reportChartTypeState, {
            ...get(reportChartTypeState),
            [cardId]: newValue,
          });
        },
      ),
    );
  }
  return chartTypeAtomCache.get(cardId)!;
};

export const getReportDateFilterAtom = (cardId: string) => {
  if (!dateFilterAtomCache.has(cardId)) {
    dateFilterAtomCache.set(
      cardId,
      atom(
        (get) => get(reportDateFilterState)[cardId] || '',
        (get, set, newValue: string) => {
          set(reportDateFilterState, {
            ...get(reportDateFilterState),
            [cardId]: newValue,
          });
        },
      ),
    );
  }
  return dateFilterAtomCache.get(cardId)!;
};

export const getReportSourceFilterAtom = (cardId: string) => {
  if (!sourceFilterAtomCache.has(cardId)) {
    sourceFilterAtomCache.set(
      cardId,
      atom(
        (get) => get(reportSourceFilterState)[cardId] || 'all',
        (get, set, newValue: string) => {
          set(reportSourceFilterState, {
            ...get(reportSourceFilterState),
            [cardId]: newValue,
          });
        },
      ),
    );
  }
  return sourceFilterAtomCache.get(cardId)!;
};

