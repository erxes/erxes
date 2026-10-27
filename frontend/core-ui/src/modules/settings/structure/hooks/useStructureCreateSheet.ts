import { usePreviousHotkeyScope, useSetHotkeyScope } from 'erxes-ui';
import { PrimitiveAtom, useAtom } from 'jotai';
import { useCallback } from 'react';
import {
  branchCreateState,
  departmentCreateState,
  TStructureCreateTarget,
} from '../states/structureCreateState';
import { BranchHotKeyScope } from '../types/branch';
import { DepartmentHotKeyScope } from '../types/department';

type TUseStructureCreateSheetProps = {
  state: PrimitiveAtom<TStructureCreateTarget | null>;
  sheetScope: string;
  pageScope: string;
};

const useStructureCreateSheet = ({
  state,
  sheetScope,
  pageScope,
}: TUseStructureCreateSheetProps) => {
  const [target, setTarget] = useAtom(state);
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  // Shared by the topbar button and the chart "+" so both set the same scope
  const openSheet = useCallback(
    (next: TStructureCreateTarget = {}) => {
      setTarget(next);
      setHotkeyScopeAndMemorizePreviousScope(sheetScope);
    },
    [setTarget, setHotkeyScopeAndMemorizePreviousScope, sheetScope],
  );

  const closeSheet = useCallback(() => {
    setHotkeyScope(pageScope);
    setTarget(null);
  }, [setHotkeyScope, setTarget, pageScope]);

  return { target, isOpen: target !== null, openSheet, closeSheet };
};

export const useDepartmentCreateSheet = () =>
  useStructureCreateSheet({
    state: departmentCreateState,
    sheetScope: DepartmentHotKeyScope.DepartmentAddSheet,
    pageScope: DepartmentHotKeyScope.DepartmentSettingsPage,
  });

export const useBranchCreateSheet = () =>
  useStructureCreateSheet({
    state: branchCreateState,
    sheetScope: BranchHotKeyScope.BranchAddSheet,
    pageScope: BranchHotKeyScope.BranchSettingsPage,
  });
