import { useAtom, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import {
  dirtyAtom,
  historyAtom,
  pageDraftAtom,
  selectedNodeIdAtom,
  selectedNodeIdsAtom,
} from '../states/builderStates';
import { BuilderNode, Frame, LayoutPage, NodeStyle } from '../types';
import {
  cloneWithNewIds,
  findNode,
  findParent,
  insertAt,
  mapTree,
  moveNode as moveNodeUtil,
  removeAt,
  replaceProps,
} from '../utils/tree';
import { GridLayoutCell } from '../types';
import { createNodeByType } from '../elements/registry';
import { id } from '../utils/id';
import { usePages } from './usePages';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export type AlignKind =
  | 'left'
  | 'right'
  | 'center-x'
  | 'top'
  | 'bottom'
  | 'center-y';

export type DistributeKind = 'horizontal' | 'vertical';

export const useBuilderActions = () => {
  const [draft, setDraft] = useAtom(pageDraftAtom);
  const [history, setHistory] = useAtom(historyAtom);
  const setSelected = useSetAtom(selectedNodeIdAtom);
  const setSelectedIds = useSetAtom(selectedNodeIdsAtom);
  const setDirty = useSetAtom(dirtyAtom);
  const { update, slugTaken } = usePages();

  const commit = useCallback(
    (nextRoot: BuilderNode) => {
      if (!draft) return;
      setHistory((h) => ({ past: [...h.past, draft.root], future: [] }));
      setDraft({ ...draft, root: nextRoot });
      setDirty(true);
    },
    [draft, setDraft, setDirty, setHistory],
  );

  const selectNode = useCallback(
    (nodeId: string | null) => setSelected(nodeId),
    [setSelected],
  );

  const selectMany = useCallback(
    (ids: string[]) => setSelectedIds(ids),
    [setSelectedIds],
  );

  const insertNode = useCallback(
    (parentId: string, index: number, node: BuilderNode) => {
      if (!draft) return;
      commit(insertAt(draft.root, parentId, index, node));
      setSelected(node.id);
    },
    [draft, commit, setSelected],
  );

  const insertByType = useCallback(
    (parentId: string, index: number, type: string) => {
      const node = createNodeByType(type);
      if (!node) return;
      insertNode(parentId, index, node);
    },
    [insertNode],
  );

  /**
   * Insert a palette item at an absolute pixel position. Auto-assigns the next
   * z-index so the new node lands on top.
   */
  const insertByTypeAtFrame = useCallback(
    (
      parentId: string,
      type: string,
      position: { x: number; y: number },
    ) => {
      if (!draft) return;
      const node = createNodeByType(type);
      if (!node) return;
      const siblings = draft.root.children ?? [];
      const maxZ = siblings.reduce((acc, n) => Math.max(acc, n.zIndex ?? 0), 0);
      const placed: BuilderNode = {
        ...node,
        frame: { x: position.x, y: position.y },
        zIndex: maxZ + 1,
      };
      commit(insertAt(draft.root, parentId, siblings.length, placed));
      setSelected(placed.id);
    },
    [draft, commit, setSelected],
  );

  /** @deprecated kept for legacy callers */
  const insertByTypeAt = useCallback(
    (
      parentId: string,
      _index: number,
      type: string,
      _layout?: GridLayoutCell,
    ) => {
      insertByTypeAtFrame(parentId, type, { x: 80, y: 80 });
    },
    [insertByTypeAtFrame],
  );

  const setFrames = useCallback(
    (updates: Array<{ id: string } & Partial<Frame>>) => {
      if (!draft || updates.length === 0) return;
      const map = new Map(updates.map((u) => [u.id, u]));
      let changed = false;
      const next = mapTree(draft.root, (n) => {
        const u = map.get(n.id);
        if (!u) return n;
        const cur = n.frame ?? { x: 0, y: 0 };
        const merged: Frame = {
          x: u.x ?? cur.x,
          y: u.y ?? cur.y,
          ...(u.w !== undefined || cur.w !== undefined
            ? { w: u.w ?? cur.w }
            : {}),
          ...(u.h !== undefined || cur.h !== undefined
            ? { h: u.h ?? cur.h }
            : {}),
          ...(u.rotation !== undefined || cur.rotation !== undefined
            ? { rotation: u.rotation ?? cur.rotation }
            : {}),
        };
        if (
          n.frame &&
          n.frame.x === merged.x &&
          n.frame.y === merged.y &&
          n.frame.w === merged.w &&
          n.frame.h === merged.h &&
          n.frame.rotation === merged.rotation
        ) {
          return n;
        }
        changed = true;
        return { ...n, frame: merged };
      });
      if (!changed) return;
      commit(next);
    },
    [draft, commit],
  );

  /** @deprecated grid layout writer; kept so legacy callers keep compiling */
  const setLayouts = useCallback(
    (_updates: Array<GridLayoutCell & { id: string }>) => {
      // no-op in free-form mode
    },
    [],
  );

  const setZIndex = useCallback(
    (nodeId: string, zIndex: number) => {
      if (!draft) return;
      commit(
        mapTree(draft.root, (n) =>
          n.id === nodeId ? { ...n, zIndex } : n,
        ),
      );
    },
    [draft, commit],
  );

  const reorderZ = useCallback(
    (nodeId: string, kind: 'front' | 'back' | 'forward' | 'backward') => {
      if (!draft) return;
      const siblings = draft.root.children ?? [];
      if (!siblings.length) return;
      const sorted = [...siblings].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
      );
      const cur = sorted.findIndex((n) => n.id === nodeId);
      if (cur === -1) return;
      let target = cur;
      if (kind === 'front') target = sorted.length - 1;
      else if (kind === 'back') target = 0;
      else if (kind === 'forward') target = Math.min(cur + 1, sorted.length - 1);
      else target = Math.max(cur - 1, 0);
      if (target === cur) return;
      const moved = sorted.splice(cur, 1)[0];
      sorted.splice(target, 0, moved);
      const updates = new Map(sorted.map((n, i) => [n.id, i + 1]));
      commit(
        mapTree(draft.root, (n) =>
          updates.has(n.id) ? { ...n, zIndex: updates.get(n.id)! } : n,
        ),
      );
    },
    [draft, commit],
  );

  const reorderToIndex = useCallback(
    (nodeId: string, newIndex: number) => {
      if (!draft) return;
      const siblings = draft.root.children ?? [];
      const sorted = [...siblings].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
      );
      const cur = sorted.findIndex((n) => n.id === nodeId);
      if (cur === -1) return;
      const target = Math.max(0, Math.min(newIndex, sorted.length - 1));
      if (target === cur) return;
      const moved = sorted.splice(cur, 1)[0];
      sorted.splice(target, 0, moved);
      const updates = new Map(sorted.map((n, i) => [n.id, i + 1]));
      commit(
        mapTree(draft.root, (n) =>
          updates.has(n.id) ? { ...n, zIndex: updates.get(n.id)! } : n,
        ),
      );
    },
    [draft, commit],
  );

  const alignSelection = useCallback(
    (ids: string[], kind: AlignKind) => {
      if (!draft || ids.length < 2) return;
      const nodes = ids
        .map((nid) => findNode(draft.root, nid))
        .filter((n): n is BuilderNode => !!n && !!n.frame);
      if (nodes.length < 2) return;
      const frames = nodes.map((n) => n.frame!);
      const minX = Math.min(...frames.map((f) => f.x));
      const maxX = Math.max(...frames.map((f) => f.x + (f.w ?? 0)));
      const minY = Math.min(...frames.map((f) => f.y));
      const maxY = Math.max(...frames.map((f) => f.y + (f.h ?? 0)));
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const updates = nodes.map((n) => {
        const f = n.frame!;
        const w = f.w ?? 0;
        const h = f.h ?? 0;
        let x = f.x;
        let y = f.y;
        if (kind === 'left') x = minX;
        else if (kind === 'right') x = maxX - w;
        else if (kind === 'center-x') x = cx - w / 2;
        else if (kind === 'top') y = minY;
        else if (kind === 'bottom') y = maxY - h;
        else if (kind === 'center-y') y = cy - h / 2;
        return { id: n.id, x: Math.round(x), y: Math.round(y) };
      });
      setFrames(updates);
    },
    [draft, setFrames],
  );

  const distributeSelection = useCallback(
    (ids: string[], kind: DistributeKind) => {
      if (!draft || ids.length < 3) return;
      const nodes = ids
        .map((nid) => findNode(draft.root, nid))
        .filter((n): n is BuilderNode => !!n && !!n.frame);
      if (nodes.length < 3) return;
      const axis = kind === 'horizontal' ? 'x' : 'y';
      const span = kind === 'horizontal' ? 'w' : 'h';
      const sorted = [...nodes].sort(
        (a, b) => a.frame![axis] - b.frame![axis],
      );
      const first = sorted[0].frame!;
      const last = sorted[sorted.length - 1].frame!;
      const lastSpan = last[span] ?? 0;
      const totalSpan = last[axis] + lastSpan - first[axis];
      const usedSpan = sorted.reduce(
        (acc, n) => acc + (n.frame![span] ?? 0),
        0,
      );
      const gap = (totalSpan - usedSpan) / (sorted.length - 1);
      let cursor = first[axis];
      const updates = sorted.map((n) => {
        const f = n.frame!;
        const value = Math.round(cursor);
        cursor += (f[span] ?? 0) + gap;
        return axis === 'x'
          ? { id: n.id, x: value }
          : { id: n.id, y: value };
      });
      setFrames(updates);
    },
    [draft, setFrames],
  );

  const removeNode = useCallback(
    (nodeId: string) => {
      if (!draft) return;
      if (nodeId === draft.root.id) return;
      commit(removeAt(draft.root, nodeId));
      setSelected(null);
    },
    [draft, commit, setSelected],
  );

  const removeMany = useCallback(
    (ids: string[]) => {
      if (!draft || ids.length === 0) return;
      let next = draft.root;
      for (const nodeId of ids) {
        if (nodeId === draft.root.id) continue;
        next = removeAt(next, nodeId);
      }
      if (next === draft.root) return;
      commit(next);
      setSelectedIds([]);
    },
    [draft, commit, setSelectedIds],
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      if (!draft) return;
      const parent = findParent(draft.root, nodeId);
      if (!parent) return;
      const original = findNode(draft.root, nodeId);
      if (!original) return;
      const copy = cloneWithNewIds(clone(original), id);
      const offset = 16;
      if (copy.frame) {
        copy.frame = {
          ...copy.frame,
          x: copy.frame.x + offset,
          y: copy.frame.y + offset,
        };
      }
      const siblings = parent.parent.children ?? [];
      const maxZ = siblings.reduce((acc, n) => Math.max(acc, n.zIndex ?? 0), 0);
      copy.zIndex = maxZ + 1;
      const next = insertAt(
        draft.root,
        parent.parent.id,
        parent.index + 1,
        copy,
      );
      commit(next);
      setSelected(copy.id);
    },
    [draft, commit, setSelected],
  );

  const moveNode = useCallback(
    (nodeId: string, parentId: string, index: number) => {
      if (!draft) return;
      const next = moveNodeUtil(draft.root, nodeId, parentId, index);
      if (next === draft.root) return;
      commit(next);
    },
    [draft, commit],
  );

  const moveByDelta = useCallback(
    (nodeId: string, delta: number) => {
      if (!draft) return;
      const parent = findParent(draft.root, nodeId);
      if (!parent) return;
      const newIndex = parent.index + delta;
      if (newIndex < 0 || newIndex >= parent.parent.children!.length) return;
      moveNode(nodeId, parent.parent.id, newIndex);
    },
    [draft, moveNode],
  );

  const setProp = useCallback(
    (nodeId: string, key: string, value: unknown) => {
      if (!draft) return;
      const next = replaceProps(draft.root, nodeId, { [key]: value });
      commit(next);
    },
    [draft, commit],
  );

  const setNodeFlag = useCallback(
    (
      nodeId: string,
      key: 'locked' | 'hidden',
      value: boolean,
    ) => {
      if (!draft) return;
      commit(
        mapTree(draft.root, (n) =>
          n.id === nodeId ? { ...n, [key]: value } : n,
        ),
      );
    },
    [draft, commit],
  );

  const renameNode = useCallback(
    (nodeId: string, name: string) => {
      if (!draft) return;
      commit(
        mapTree(draft.root, (n) =>
          n.id === nodeId ? { ...n, name } : n,
        ),
      );
    },
    [draft, commit],
  );

  const setStyle = useCallback(
    (nodeId: string, patch: Partial<NodeStyle>) => {
      if (!draft) return;
      commit(
        mapTree(draft.root, (n) =>
          n.id === nodeId
            ? { ...n, style: { ...(n.style ?? {}), ...patch } }
            : n,
        ),
      );
    },
    [draft, commit],
  );

  const clearFrameSize = useCallback(
    (nodeId: string) => {
      if (!draft) return;
      commit(
        mapTree(draft.root, (n) => {
          if (n.id !== nodeId || !n.frame) return n;
          const { w: _w, h: _h, ...rest } = n.frame;
          return { ...n, frame: rest };
        }),
      );
    },
    [draft, commit],
  );

  const setMeta = useCallback(
    (patch: Partial<Pick<LayoutPage, 'title' | 'slug'>>) => {
      if (!draft) return;
      setDraft({ ...draft, ...patch });
      setDirty(true);
    },
    [draft, setDraft, setDirty],
  );

  const setPageBackground = useCallback(
    (background: string | undefined) => {
      if (!draft) return;
      setDraft({ ...draft, background });
      setDirty(true);
    },
    [draft, setDraft, setDirty],
  );

  const undo = useCallback(() => {
    if (!draft) return;
    setHistory((h) => {
      if (!h.past.length) return h;
      const previous = h.past[h.past.length - 1];
      const newPast = h.past.slice(0, -1);
      setDraft({ ...draft, root: previous });
      setDirty(true);
      return { past: newPast, future: [draft.root, ...h.future] };
    });
  }, [draft, setDraft, setDirty, setHistory]);

  const redo = useCallback(() => {
    if (!draft) return;
    setHistory((h) => {
      if (!h.future.length) return h;
      const next = h.future[0];
      const newFuture = h.future.slice(1);
      setDraft({ ...draft, root: next });
      setDirty(true);
      return { past: [...h.past, draft.root], future: newFuture };
    });
  }, [draft, setDraft, setDirty, setHistory]);

  const save = useCallback(() => {
    if (!draft) return { ok: false as const, error: 'No page loaded' };
    if (!draft.title.trim()) {
      return { ok: false as const, error: 'Title is required' };
    }
    if (!draft.slug.trim()) {
      return { ok: false as const, error: 'Slug is required' };
    }
    if (slugTaken(draft.slug, draft.id)) {
      return { ok: false as const, error: 'Slug is already used' };
    }
    const result = update(draft);
    if (result.ok) {
      setDirty(false);
    }
    return result;
  }, [draft, update, slugTaken, setDirty]);

  const togglePublish = useCallback(
    (on: boolean) => {
      if (!draft) return { ok: false as const, error: 'No page loaded' };
      const next: LayoutPage = {
        ...draft,
        status: on ? 'published' : 'draft',
      };
      setDraft(next);
      const result = update(next);
      if (result.ok) setDirty(false);
      return result;
    },
    [draft, setDraft, update, setDirty],
  );

  return {
    draft,
    history,
    selectNode,
    selectMany,
    insertNode,
    insertByType,
    insertByTypeAt,
    insertByTypeAtFrame,
    setLayouts,
    setFrames,
    setZIndex,
    reorderZ,
    reorderToIndex,
    alignSelection,
    distributeSelection,
    removeNode,
    removeMany,
    duplicateNode,
    moveNode,
    moveByDelta,
    setProp,
    setNodeFlag,
    renameNode,
    setStyle,
    clearFrameSize,
    setMeta,
    setPageBackground,
    undo,
    redo,
    save,
    togglePublish,
  };
};
