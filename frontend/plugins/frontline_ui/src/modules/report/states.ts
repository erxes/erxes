import { atom, WritableAtom } from 'jotai';
import { ResponsesChartType } from './types';

export const reportChartTypeState = atom<Record<string, ResponsesChartType>>(
  {},
);

export const reportDateFilterState = atom<Record<string, string>>({});

export const reportSourceFilterState = atom<Record<string, string>>({});

export const reportChannelFilterState = atom<Record<string, string[]>>({});

export const reportMemberFilterState = atom<Record<string, string[]>>({});

const chartTypeAtomCache = new Map<
  string,
  WritableAtom<ResponsesChartType, [ResponsesChartType], void>
>();

const dateFilterAtomCache = new Map<
  string,
  WritableAtom<string, [string], void>
>();

const sourceFilterAtomCache = new Map<
  string,
  WritableAtom<string, [string], void>
>();

export const reportSheetOpenState = atom<boolean>(false);

export const reportWidgetStepState = atom<number>(0);
const channelFilterAtomCache = new Map<
  string,
  WritableAtom<string[], [string[]], void>
>();

const memberFilterAtomCache = new Map<
  string,
  WritableAtom<string[], [string[]], void>
>();
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
export const getReportChannelFilterAtom = (cardId: string) => {
  if (!channelFilterAtomCache.has(cardId)) {
    channelFilterAtomCache.set(
      cardId,
      atom(
        (get) => get(reportChannelFilterState)[cardId] || [],
        (get, set, newValue: string[]) => {
          set(reportChannelFilterState, {
            ...get(reportChannelFilterState),
            [cardId]: newValue,
          });
        },
      ),
    );
  }
  return channelFilterAtomCache.get(cardId)!;
};

export const getReportMemberFilterAtom = (cardId: string) => {
  if (!memberFilterAtomCache.has(cardId)) {
    memberFilterAtomCache.set(
      cardId,
      atom(
        (get) => get(reportMemberFilterState)[cardId] || [],
        (get, set, newValue: string[]) => {
          set(reportMemberFilterState, {
            ...get(reportMemberFilterState),
            [cardId]: newValue,
          });
        },
      ),
    );
  }
  return memberFilterAtomCache.get(cardId)!;
};
