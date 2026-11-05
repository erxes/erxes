import { atomWithStorage } from 'jotai/utils';

export type TStructureView = 'list' | 'chart';

export const structureViewState = atomWithStorage<TStructureView>(
  'structureView',
  'list',
);

// Shows the chart's "+" buttons and placeholders to users who can edit
export const structureChartEditModeState = atomWithStorage<boolean>(
  'structureChartEditMode',
  true,
);
