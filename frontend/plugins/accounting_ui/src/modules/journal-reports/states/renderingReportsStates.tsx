import { atom } from 'jotai';

export const activeReportState = atom<string>('');
export const activeReportGroupState = atom<string>('');

export const moreDataState = atom<{ [key: string]: any[] }>({});
