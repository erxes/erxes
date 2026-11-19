import type { UnitNode } from '@erxes/core-contract';
import { useQueryState } from 'nuqs';
import { type MouseEvent, useState } from 'react';
import { type TreeIndex, treeRows } from './unitTree';
import { usePicked } from './usePicked';
import type { UnitTree } from './useUnitTree';

/** The selected unit (`?unit=`), kept in the address so a link opens the page on it. */
export const useSelectedUnit = () => useQueryState('unit', { history: 'replace' });

/**
 * What is selected on the page: the unit open beside the tree, or the units picked together to
 * move or delete, and the unit to bring in sight. `canPick` lets a click with Shift or Ctrl held
 * pick; `ranges` makes Shift take every unit from the last one clicked, as the tree does.
 */
export const useSelection = ({
  index,
  tree,
  canPick,
  ranges,
}: {
  index: TreeIndex;
  tree: UnitTree;
  canPick: boolean;
  ranges: boolean;
}) => {
  const [selectedId, setSelectedId] = useSelectedUnit();
  const [focusId, setFocusId] = useState<string | null>(selectedId);

  const { picked, pick, resetPicked } = usePicked({
    open: selectedId ? index.byId.get(selectedId) : undefined,
    closeOpen: () => void setSelectedId(null),
    listed: () =>
      treeRows(index, tree.isOpen, null).flatMap((row) => (row.kind === 'unit' ? [row.unit] : [])),
  });

  /** Selects a unit (null: none); `reveal` also opens the units above it and brings it in sight. */
  const select = (id: string | null, reveal?: Pick<UnitNode, 'id' | 'path'>) => {
    resetPicked(id);
    void setSelectedId(id);

    if (reveal) {
      tree.openAbove(reveal);
      setFocusId(reveal.id);
    }
  };

  return {
    selectedId,
    select,
    /** The units picked together with Shift or Ctrl held, to move or delete in one go. */
    picked,
    resetPicked,
    /** A click on a unit: it is selected, or with Shift or Ctrl held it joins the picked ones. */
    clickUnit: (unit: UnitNode, keys: Pick<MouseEvent, 'shiftKey' | 'metaKey' | 'ctrlKey'>) => {
      if (!canPick || !(keys.shiftKey || keys.metaKey || keys.ctrlKey)) select(unit.id);
      else pick(unit, keys.shiftKey && ranges ? 'range' : 'toggle');
    },
    /** The unit to bring in sight once it is drawn. */
    focusId,
    clearFocus: () => setFocusId(null),
  };
};
