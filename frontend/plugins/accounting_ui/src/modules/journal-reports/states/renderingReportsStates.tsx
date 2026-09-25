import { atom } from 'jotai';

type ReportRecord = Record<string, unknown>;

export const activeReportState = atom<string>('');
export const activeReportGroupState = atom<string>('');

export const moreDataState = atom<Record<string, ReportRecord[]>>({});
