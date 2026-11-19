import type { UnitNode } from '@erxes/core-contract';
import { useState } from 'react';

/** `range` picks every unit from the last clicked one to this one; `toggle` adds or drops one. */
export type PickMode = 'range' | 'toggle';

const byId = (units: UnitNode[]) => new Map(units.map((unit) => [unit.id, unit]));

/** The units between `fromId` and `toId` as the tree lists them, both included. */
const between = (listed: UnitNode[], fromId: string, toId: string) => {
  const from = listed.findIndex((unit) => unit.id === fromId);
  const to = listed.findIndex((unit) => unit.id === toId);

  return from === -1 || to === -1
    ? null
    : listed.slice(Math.min(from, to), Math.max(from, to) + 1).filter((unit) => unit.parentId);
};

/**
 * The units picked together, to move or delete in one go. The first pick takes the open unit
 * along and closes it, so the picked units are the whole selection. The organisation's own unit
 * can't be picked, since it can't be moved or deleted.
 */
export const usePicked = ({
  open,
  closeOpen,
  listed,
}: {
  /** The unit open beside the tree, if any. */
  open: UnitNode | undefined;
  closeOpen: () => void;
  /** The units as the tree lists them now, for a range. */
  listed: () => UnitNode[];
}) => {
  const [picked, setPicked] = useState(new Map<string, UnitNode>());
  const [anchorId, setAnchorId] = useState<string | null>(null);

  const pick = (unit: UnitNode, mode: PickMode) => {
    if (!unit.parentId) return;

    const fromId = anchorId ?? open?.id ?? unit.id;
    const range = mode === 'range' ? between(listed(), fromId, unit.id) : null;

    if (open) closeOpen();

    if (range) {
      setPicked(byId(range));
      setAnchorId(fromId);

      return;
    }

    const next = picked.size ? new Map(picked) : byId(open?.parentId ? [open] : []);

    if (!next.delete(unit.id)) next.set(unit.id, unit);

    setPicked(next);
    setAnchorId(unit.id);
  };

  return {
    picked,
    pick,
    /** Drops the picked units; a range then starts from `anchor`. */
    resetPicked: (anchor: string | null = null) => {
      if (picked.size) setPicked(new Map());

      setAnchorId(anchor);
    },
  };
};
