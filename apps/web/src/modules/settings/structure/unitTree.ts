import type { UnitDetail, UnitNode, UnitType } from '@erxes/core-contract';

/** How many units one `units.children` call brings. */
export const PAGE_SIZE = 50;

/** The most children the panel reorders by dragging: what one `units.reorder` takes. */
export const REORDER_MAX = 200;

export type ChildPage = { data: UnitNode[]; nextCursor: string | null; totalCount: number };

/** The loaded part of the tree: each opened unit's pages, and what is left to load under it. */
export type TreeIndex = {
  root: UnitNode;
  byId: Map<string, UnitNode>;
  children: Map<string, UnitNode[]>;
  more: Map<string, { nextCursor: string; left: number }>;
};

/** A unit as `units.get` reads it, counted as the tree counts it. */
export const nodeOf = (unit: UnitDetail): UnitNode => ({
  ...unit,
  memberCount: unit.memberIds.length,
});

/** The ids above a unit, from the top, out of its `path`. */
export const ancestorIds = (unit: Pick<UnitNode, 'id' | 'path'>) =>
  unit.path.split('/').filter((id) => id && id !== unit.id);

/** Whether `unit` is `other` or sits anywhere under it. */
export const isWithin = (unit: Pick<UnitNode, 'path'>, other: Pick<UnitNode, 'path'>) =>
  unit.path.startsWith(other.path);

/**
 * The tree from the pages loaded so far. `pins` (a unit and the units above it) join their
 * parents' lists when the loaded pages don't hold them yet, so a unit found by search shows in
 * place before its page loads.
 */
export const buildIndex = (
  root: UnitNode,
  loaded: { parentId: string; pages: ChildPage[] }[],
  pins: UnitNode[],
): TreeIndex => {
  const children = new Map<string, UnitNode[]>();
  const more = new Map<string, { nextCursor: string; left: number }>();

  for (const { parentId, pages } of loaded) {
    const list = pages.flatMap((page) => page.data);
    const last = pages.at(-1);

    children.set(parentId, list);

    if (last?.nextCursor)
      more.set(parentId, {
        nextCursor: last.nextCursor,
        left: Math.max(last.totalCount - list.length, 0),
      });
  }

  for (const pin of pins) {
    const list = pin.parentId ? (children.get(pin.parentId) ?? []) : null;

    if (pin.parentId && list && !list.some((unit) => unit.id === pin.id))
      children.set(pin.parentId, [...list, pin]);
  }

  const byId = new Map([[root.id, root]]);

  for (const list of children.values()) for (const unit of list) byId.set(unit.id, unit);

  return { root, byId, children, more };
};

export type TreeRow =
  | { kind: 'unit'; unit: UnitNode; depth: number; expanded: boolean }
  | { kind: 'more'; parentId: string; depth: number; left: number }
  | { kind: 'draft'; parentId: string; depth: number };

/** Whether a unit's subunits show: opened, or a unit is being added under it. */
export type IsOpen = (unit: UnitNode) => boolean;

/** The list view's rows, depth first: each open unit's loaded subunits, then what is left. */
export const treeRows = (index: TreeIndex, isOpen: IsOpen, draftParentId: string | null) => {
  const rows: TreeRow[] = [];

  const walk = (unit: UnitNode, depth: number) => {
    const expanded = isOpen(unit);

    rows.push({ kind: 'unit', unit, depth, expanded });

    if (!expanded) return;

    for (const child of index.children.get(unit.id) ?? []) walk(child, depth + 1);

    const more = index.more.get(unit.id);

    if (more) rows.push({ kind: 'more', parentId: unit.id, depth: depth + 1, left: more.left });

    if (draftParentId === unit.id)
      rows.push({ kind: 'draft', parentId: unit.id, depth: depth + 1 });
  };

  walk(index.root, 0);

  return rows;
};

/**
 * Types a new unit may have under `parent`: active, shown here, and allowed there. Right under
 * the organisation's own unit only types that can be at the top fit.
 */
export const allowedChildTypes = (types: UnitType[], parent: UnitNode | undefined) => {
  const parentTypeId = parent?.typeId ?? null;

  return types.filter(
    (type) =>
      type.isActive &&
      !type.hidden &&
      (parentTypeId
        ? !type.allowedParentTypeIds.length || type.allowedParentTypeIds.includes(parentTypeId)
        : type.canBeRoot),
  );
};

/**
 * The type a new unit starts with: the one most of its siblings have, else one that names the
 * parent's type, else the first that fits.
 */
export const defaultChildType = (
  siblings: UnitNode[],
  allowed: UnitType[],
  parentTypeId: string | null,
) => {
  const counts = new Map<string, number>();

  for (const { typeId } of siblings) if (typeId) counts.set(typeId, (counts.get(typeId) ?? 0) + 1);

  const common = [...counts]
    .toSorted((a, b) => b[1] - a[1])
    .map(([typeId]) => typeId)
    .find((typeId) => allowed.some((type) => type.id === typeId));

  if (common) return common;

  const named = parentTypeId
    ? allowed.find((type) => type.allowedParentTypeIds.includes(parentTypeId))
    : undefined;

  return (named ?? allowed[0])?.id;
};
