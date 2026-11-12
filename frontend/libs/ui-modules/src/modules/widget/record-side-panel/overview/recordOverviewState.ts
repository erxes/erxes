import { atomWithStorage } from 'jotai/utils';

export interface IRecordOverviewLayout {
  order: string[];
  tabs: string[];
}

export const recordOverviewFoldedState = atomWithStorage<
  Record<string, boolean>
>('erxes:contactOverviewFolded', {});

export const recordOverviewLayoutState = atomWithStorage<
  Record<string, IRecordOverviewLayout>
>('erxes:contactOverviewLayout', {});
