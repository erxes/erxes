import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { Resizable } from 'erxes-ui';

import {
  dragSourceAtom,
  pageDraftAtom,
  selectedNodeIdAtom,
} from '../states/builderStates';
import { LayoutPage } from '../types';
import { useBuilderActions } from '../hooks/useBuilderActions';
import { createNodeByType, getDef } from '../elements/registry';
import { findNode } from '../utils/tree';
import { Toolbar } from './Toolbar';
import { ComponentsPanel } from './ComponentsPanel';
import { Canvas } from './Canvas';
import { Inspector } from './Inspector';

type DropData =
  | { kind: 'gap'; parentId: string; index: number }
  | { kind: 'inside'; parentId: string };

export const Editor = ({ page }: { page: LayoutPage }) => {
  const [draft, setDraft] = useAtom(pageDraftAtom);
  const setSelected = useSetAtom(selectedNodeIdAtom);
  const setDragSource = useSetAtom(dragSourceAtom);
  const dragSource = useAtomValue(dragSourceAtom);
  const { insertNode, moveNode, undo, redo } = useBuilderActions();
  const [overlayLabel, setOverlayLabel] = useState<string | null>(null);

  // Load page into draft on mount / page change
  useEffect(() => {
    setDraft(page);
    setSelected(null);
    return () => {
      setDraft(null);
      setSelected(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  // Keyboard shortcuts (undo/redo)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.key.toLowerCase() === 'z' && e.shiftKey) ||
        e.key.toLowerCase() === 'y'
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as
      | { source: 'palette'; type: string }
      | { source: 'node'; id: string }
      | undefined;
    if (!data) return;
    if (data.source === 'palette') {
      setDragSource({ kind: 'palette', type: data.type });
      const def = getDef(data.type);
      setOverlayLabel(def?.label ?? data.type);
    } else if (data.source === 'node') {
      setDragSource({ kind: 'node', id: data.id });
      if (draft) {
        const node = findNode(draft.root, data.id);
        const def = node ? getDef(node.type) : undefined;
        setOverlayLabel(def?.label ?? 'Block');
      }
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setOverlayLabel(null);
    const drop = e.over?.data.current as DropData | undefined;
    const drag = e.active.data.current as
      | { source: 'palette'; type: string }
      | { source: 'node'; id: string }
      | undefined;
    setDragSource(null);
    if (!drop || !drag) return;

    // Resolve target parent and index
    const parentId = drop.parentId;
    let index: number;
    if (drop.kind === 'gap') {
      index = drop.index;
    } else {
      const parentNode = draft ? findNode(draft.root, parentId) : null;
      index = parentNode?.children?.length ?? 0;
    }

    // Check target accepts children
    const parentNode = draft ? findNode(draft.root, parentId) : null;
    const parentDef = parentNode ? getDef(parentNode.type) : undefined;
    if (!parentDef?.acceptsChildren) return;

    if (drag.source === 'palette') {
      const node = createNodeByType(drag.type);
      if (!node) return;
      insertNode(parentId, index, node);
    } else if (drag.source === 'node') {
      moveNode(drag.id, parentId, index);
    }
  };

  const handleDragCancel = () => {
    setDragSource(null);
    setOverlayLabel(null);
  };

  if (!draft) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <Toolbar />
        <div className="flex-1 overflow-hidden">
          <Resizable.PanelGroup direction="horizontal">
            <Resizable.Panel defaultSize={20} minSize={15} maxSize={35}>
              <ComponentsPanel />
            </Resizable.Panel>
            <Resizable.Handle />
            <Resizable.Panel defaultSize={56} minSize={30}>
              <Canvas />
            </Resizable.Panel>
            <Resizable.Handle />
            <Resizable.Panel defaultSize={24} minSize={15} maxSize={40}>
              <Inspector />
            </Resizable.Panel>
          </Resizable.PanelGroup>
        </div>
      </div>
      <DragOverlay>
        {overlayLabel ? (
          <div className="rounded-md border bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-md">
            {overlayLabel}
            {dragSource?.kind === 'palette' ? ' (new)' : ''}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
