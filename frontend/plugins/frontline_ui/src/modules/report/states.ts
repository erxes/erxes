import { atom, WritableAtom } from 'jotai';
import { ResponsesChartType } from './types';

function getOrCreate<K, V>(map: Map<K, V>, key: K, factory: () => V): V {
  let value = map.get(key);
  if (value === undefined) {
    value = factory();
    map.set(key, value);
  }
  return value;
}

export const reportChartTypeState = atom<Record<string, ResponsesChartType>>(
  {},
);

export const reportDateFilterState = atom<Record<string, string>>({});

export const reportSourceFilterState = atom<Record<string, string>>({});

export const reportChannelFilterState = atom<Record<string, string[]>>({});

export const reportMemberFilterState = atom<Record<string, string[]>>({});

export const reportCallStatusFilterState = atom<Record<string, string>>({});

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
const channelFilterAtomCache = new Map<
  string,
  WritableAtom<string[], [string[]], void>
>();

const memberFilterAtomCache = new Map<
  string,
  WritableAtom<string[], [string[]], void>
>();

const callStatusFilterAtomCache = new Map<
  string,
  WritableAtom<string, [string], void>
>();
export const getReportChartTypeAtom = (cardId: string) =>
  getOrCreate(chartTypeAtomCache, cardId, () =>
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

export const getReportDateFilterAtom = (cardId: string) =>
  getOrCreate(dateFilterAtomCache, cardId, () =>
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

export const getReportSourceFilterAtom = (cardId: string) =>
  getOrCreate(sourceFilterAtomCache, cardId, () =>
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
export const getReportChannelFilterAtom = (cardId: string) =>
  getOrCreate(channelFilterAtomCache, cardId, () =>
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

export const getReportMemberFilterAtom = (cardId: string) =>
  getOrCreate(memberFilterAtomCache, cardId, () =>
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

export const getReportCallStatusFilterAtom = (cardId: string) =>
  getOrCreate(callStatusFilterAtomCache, cardId, () =>
    atom(
      (get) => get(reportCallStatusFilterState)[cardId] || 'all',
      (get, set, newValue: string) => {
        set(reportCallStatusFilterState, {
          ...get(reportCallStatusFilterState),
          [cardId]: newValue,
        });
      },
    ),
  );

// Ticket-specific filter atoms
export const reportPipelineFilterState = atom<Record<string, string[]>>({});
export const reportTicketTagFilterState = atom<Record<string, string[]>>({});
export const reportStateFilterState = atom<Record<string, string>>({});
export const reportPriorityFilterState = atom<Record<string, number[]>>({});
export const reportFrequencyFilterState = atom<Record<string, string>>({});

const pipelineFilterAtomCache = new Map<
  string,
  WritableAtom<string[], [string[]], void>
>();
const ticketTagFilterAtomCache = new Map<
  string,
  WritableAtom<string[], [string[]], void>
>();
const stateFilterAtomCache = new Map<
  string,
  WritableAtom<string, [string], void>
>();
const priorityFilterAtomCache = new Map<
  string,
  WritableAtom<number[], [number[]], void>
>();
const frequencyFilterAtomCache = new Map<
  string,
  WritableAtom<string, [string], void>
>();

export const getReportPipelineFilterAtom = (cardId: string) =>
  getOrCreate(pipelineFilterAtomCache, cardId, () =>
    atom(
      (get) => get(reportPipelineFilterState)[cardId] || [],
      (get, set, newValue: string[]) => {
        set(reportPipelineFilterState, {
          ...get(reportPipelineFilterState),
          [cardId]: newValue,
        });
      },
    ),
  );

export const getReportTicketTagFilterAtom = (cardId: string) =>
  getOrCreate(ticketTagFilterAtomCache, cardId, () =>
    atom(
      (get) => get(reportTicketTagFilterState)[cardId] || [],
      (get, set, newValue: string[]) => {
        set(reportTicketTagFilterState, {
          ...get(reportTicketTagFilterState),
          [cardId]: newValue,
        });
      },
    ),
  );

export const getReportStateFilterAtom = (cardId: string) =>
  getOrCreate(stateFilterAtomCache, cardId, () =>
    atom(
      (get) => get(reportStateFilterState)[cardId] || '',
      (get, set, newValue: string) => {
        set(reportStateFilterState, {
          ...get(reportStateFilterState),
          [cardId]: newValue,
        });
      },
    ),
  );

export const getReportPriorityFilterAtom = (cardId: string) =>
  getOrCreate(priorityFilterAtomCache, cardId, () =>
    atom(
      (get) => get(reportPriorityFilterState)[cardId] || [],
      (get, set, newValue: number[]) => {
        set(reportPriorityFilterState, {
          ...get(reportPriorityFilterState),
          [cardId]: newValue,
        });
      },
    ),
  );

export const getReportFrequencyFilterAtom = (cardId: string) =>
  getOrCreate(frequencyFilterAtomCache, cardId, () =>
    atom(
      (get) => get(reportFrequencyFilterState)[cardId] || 'day',
      (get, set, newValue: string) => {
        set(reportFrequencyFilterState, {
          ...get(reportFrequencyFilterState),
          [cardId]: newValue,
        });
      },
    ),
  );

// Customer & Company filter atoms
export const reportCustomerFilterState = atom<Record<string, string[]>>({});
export const reportCompanyFilterState = atom<Record<string, string[]>>({});

const customerFilterAtomCache = new Map<
  string,
  WritableAtom<string[], [string[]], void>
>();
const companyFilterAtomCache = new Map<
  string,
  WritableAtom<string[], [string[]], void>
>();

export const getReportCustomerFilterAtom = (cardId: string) =>
  getOrCreate(customerFilterAtomCache, cardId, () =>
    atom(
      (get) => get(reportCustomerFilterState)[cardId] || [],
      (get, set, newValue: string[]) => {
        set(reportCustomerFilterState, {
          ...get(reportCustomerFilterState),
          [cardId]: newValue,
        });
      },
    ),
  );

export const getReportCompanyFilterAtom = (cardId: string) =>
  getOrCreate(companyFilterAtomCache, cardId, () =>
    atom(
      (get) => get(reportCompanyFilterState)[cardId] || [],
      (get, set, newValue: string[]) => {
        set(reportCompanyFilterState, {
          ...get(reportCompanyFilterState),
          [cardId]: newValue,
        });
      },
    ),
  );
