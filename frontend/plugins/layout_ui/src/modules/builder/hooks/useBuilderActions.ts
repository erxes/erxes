import { useAtom, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import {
  dirtyAtom,
  historyAtom,
  pageDraftAtom,
  selectedNodeIdAtom,
} from '../states/builderStates';
import { BuilderNode, LayoutPage } from '../types';
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

export const useBuilderActions = () => {
  const [draft, setDraft] = useAtom(pageDraftAtom);
  const [history, setHistory] = useAtom(historyAtom);
  const setSelected = useSetAtom(selectedNodeIdAtom);
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

  const insertByTypeAt = useCallback(
    (
      parentId: string,
      index: number,
      type: string,
      layout?: GridLayoutCell,
    ) => {
      if (!draft) return;
      const node = createNodeByType(type);
      if (!node) return;
      const placed = layout ? { ...node, layout } : node;
      commit(insertAt(draft.root, parentId, index, placed));
      setSelected(placed.id);
    },
    [draft, commit, setSelected],
  );

  const setLayouts = useCallback(
    (updates: Array<GridLayoutCell & { id: string }>) => {
      if (!draft || updates.length === 0) return;
      const map = new Map(updates.map((u) => [u.id, u]));
      let changed = false;
      const next = mapTree(draft.root, (n) => {
        const u = map.get(n.id);
        if (!u) return n;
        const cur = n.layout;
        if (
          cur &&
          cur.x === u.x &&
          cur.y === u.y &&
          cur.w === u.w &&
          cur.h === u.h
        ) {
          return n;
        }
        changed = true;
        return { ...n, layout: { x: u.x, y: u.y, w: u.w, h: u.h } };
      });
      if (!changed) return;
      commit(next);
    },
    [draft, commit],
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

  const duplicateNode = useCallback(
    (nodeId: string) => {
      if (!draft) return;
      const parent = findParent(draft.root, nodeId);
      if (!parent) return;
      const original = findNode(draft.root, nodeId);
      if (!original) return;
      const copy = cloneWithNewIds(clone(original), id);
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

  const setMeta = useCallback(
    (patch: Partial<Pick<LayoutPage, 'title' | 'slug'>>) => {
      if (!draft) return;
      setDraft({ ...draft, ...patch });
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
    insertNode,
    insertByType,
    insertByTypeAt,
    setLayouts,
    removeNode,
    duplicateNode,
    moveNode,
    moveByDelta,
    setProp,
    setMeta,
    undo,
    redo,
    save,
    togglePublish,
  };
};
