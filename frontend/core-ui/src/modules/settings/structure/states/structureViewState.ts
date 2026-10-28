import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type TStructureView = 'canvas' | 'list';

export type TStructureTypeTab = 'general' | 'capabilities' | 'fields';

export const structureViewState = atomWithStorage<TStructureView>(
  'structureEntitiesView',
  'canvas',
);

export const structureShowArchivedState = atom<boolean>(false);

export const structureDraftParentState = atom<string | null>(null);

export const structureFocusState = atom<string | null>(null);

export const structureTypeSettingsState = atom<{
  typeId: string;
  tab: TStructureTypeTab;
} | null>(null);

export const structureNodeTypesOpenState = atom<boolean>(false);
