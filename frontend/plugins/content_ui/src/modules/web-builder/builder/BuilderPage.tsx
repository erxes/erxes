import { useQuery } from '@apollo/client';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Spinner, toast } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BLOCK_REGISTRY } from '../blocks/registry';
import { BlockInstance } from '../blocks/types';
import { GET_WEB_DETAIL } from '../graphql/queries/getWebDetail';
import { useEditWebPage } from '../hooks/useEditWebPage';
import { useWebPage } from '../hooks/useWebPage';
import { IWeb } from '../types';
import { blockToPageItem, newLocalId, pageItemToBlock, sortPageItems } from '../utils/serialize';
import { BuilderProvider } from './BuilderContext';
import { BuilderCanvas } from './components/BuilderCanvas';
import { BuilderInspector } from './components/BuilderInspector';
import { BuilderSidebar } from './components/BuilderSidebar';
import { BuilderToolbar } from './components/BuilderToolbar';
import {
  blocksAtom,
  dirtyAtom,
  selectedBlockIdAtom,
} from './state/builderState';

export const BuilderPage = () => {
  const { webId, pageId } = useParams();

  const { data: webData, loading: webLoading } = useQuery(GET_WEB_DETAIL, {
    variables: { _id: webId },
    skip: !webId,
  });

  const { page, loading: pageLoading } = useWebPage(pageId || '');
  const { editWebPage, loading: saving } = useEditWebPage();

  const web: IWeb | null = webData?.getWebDetail || null;
  const clientPortalId = web?.clientPortalId || page?.clientPortalId || '';

  const [blocks, setBlocks] = useAtom(blocksAtom);
  const setDirty = useSetAtom(dirtyAtom);
  const setSelected = useSetAtom(selectedBlockIdAtom);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate the canvas from the loaded page exactly once.
  useEffect(() => {
    if (!page || hydrated) return;
    const sorted = sortPageItems(page.pageItems || []);
    setBlocks(sorted.map(pageItemToBlock));
    setSelected(null);
    setDirty(false);
    setHydrated(true);
  }, [page, hydrated, setBlocks, setSelected, setDirty]);

  // Reset state on route change.
  useEffect(() => {
    return () => {
      setBlocks([]);
      setSelected(null);
      setDirty(false);
    };
  }, [pageId, setBlocks, setSelected, setDirty]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current as
        | { kind: 'palette'; key: string }
        | { kind: 'block' }
        | undefined;

      // Palette drop -> insert
      if (activeData?.kind === 'palette') {
        const def = BLOCK_REGISTRY[activeData.key];
        if (!def) return;
        const newBlock: BlockInstance = {
          _id: newLocalId(),
          key: def.key,
          props: { ...def.defaultProps },
          contentType: def.contentType,
        };
        // Insert above the hovered block, or at end if dropped on canvas.
        setBlocks((prev) => {
          if (over.id === 'canvas-drop') return [...prev, newBlock];
          const idx = prev.findIndex((b) => b._id === over.id);
          if (idx === -1) return [...prev, newBlock];
          const next = [...prev];
          next.splice(idx, 0, newBlock);
          return next;
        });
        setSelected(newBlock._id);
        setDirty(true);
        return;
      }

      // Reorder existing blocks
      if (activeData?.kind === 'block' && active.id !== over.id) {
        setBlocks((prev) => {
          const fromIdx = prev.findIndex((b) => b._id === active.id);
          const toIdx = prev.findIndex((b) => b._id === over.id);
          if (fromIdx === -1 || toIdx === -1) return prev;
          return arrayMove(prev, fromIdx, toIdx);
        });
        setDirty(true);
      }
    },
    [setBlocks, setSelected, setDirty],
  );

  const onSave = useCallback(async () => {
    if (!page || !pageId) return;
    const pageItems = blocks.map((b, idx) => blockToPageItem(b, idx));

    try {
      await editWebPage({
        variables: {
          _id: pageId,
          input: {
            name: page.name,
            slug: page.slug,
            pageItems,
          },
        },
      });
      setDirty(false);
      toast({ title: 'Saved', description: 'Page saved.' });
    } catch {
      // toast handled inside hook
    }
  }, [blocks, page, pageId, editWebPage, setDirty]);

  const ctx = useMemo(
    () => ({
      webId: webId || '',
      pageId: pageId || '',
      clientPortalId,
      web,
      page,
    }),
    [webId, pageId, clientPortalId, web, page],
  );

  if (!webId || !pageId) {
    return (
      <div className="p-8 text-sm text-destructive">
        Missing web or page identifier.
      </div>
    );
  }

  if (webLoading || pageLoading || !page) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <BuilderProvider value={ctx}>
      <div className="h-full flex flex-col">
        <BuilderToolbar saving={saving} onSave={onSave} />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 overflow-hidden">
            <BuilderSidebar />
            <BuilderCanvas />
            <BuilderInspector />
          </div>
        </DndContext>
      </div>
    </BuilderProvider>
  );
};

export default BuilderPage;
