import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import {
  structureNodeTypesOpenState,
  structureTypeSettingsState,
  TStructureTypeTab,
} from '../states/structureViewState';

export const useStructureTypeDialogs = () => {
  const setTypeSettings = useSetAtom(structureTypeSettingsState);
  const setNodeTypesOpen = useSetAtom(structureNodeTypesOpenState);

  const openTypeSettings = useCallback(
    (typeId: string, tab: TStructureTypeTab = 'general') =>
      setTypeSettings({ typeId, tab }),
    [setTypeSettings],
  );

  const openNodeTypes = useCallback(
    () => setNodeTypesOpen(true),
    [setNodeTypesOpen],
  );

  return { openTypeSettings, openNodeTypes };
};
