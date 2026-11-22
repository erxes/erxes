import { applyNodeChanges, type NodeChange } from '@xyflow/react';
import { toast } from 'erxes-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PosSaveAction } from '@/pos/components/pos-edit/PosSaveAction';
import { SlotCanvas } from '@/pos/slot/components/SlotCanvas';
import { SlotInspector } from '@/pos/slot/components/SlotInspector';
import { SlotList } from '@/pos/slot/components/SlotList';
import {
  applySlotPatch,
  arrangeSlotNodes,
  createSlotNode,
  duplicateSlotNode,
  toSlotInputs,
} from '@/pos/slot/slotNodes';
import type { SlotNode, SlotNodePatch } from '@/pos/slot/types';

interface SlotEditorProps {
  savedSlots: SlotNode[];
  saving: boolean;
  onSave: (nodes: SlotNode[]) => Promise<unknown>;
  onSaveActionChange?: (action: React.ReactNode | null) => void;
}

const layoutKey = (nodes: SlotNode[]) =>
  JSON.stringify(toSlotInputs(nodes, ''));

export const SlotEditor = ({
  savedSlots,
  saving,
  onSave,
  onSaveActionChange,
}: SlotEditorProps) => {
  const { t } = useTranslation('sales');
  const [nodes, setNodes] = useState<SlotNode[]>(savedSlots);
  const savedKey = useMemo(() => layoutKey(savedSlots), [savedSlots]);
  const isDirty = useMemo(
    () => layoutKey(nodes) !== savedKey,
    [nodes, savedKey],
  );
  const selected = nodes.find((node) => node.selected);

  useEffect(() => setNodes(savedSlots), [savedSlots]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<SlotNode>[]) =>
      setNodes((current) => applyNodeChanges(changes, current)),
    [],
  );

  const select = (id?: string) =>
    setNodes((current) =>
      current.map((node) =>
        node.selected === (node.id === id)
          ? node
          : { ...node, selected: node.id === id },
      ),
    );

  const addSlot = () =>
    setNodes((current) => [
      ...current.map((node) => ({ ...node, selected: false })),
      createSlotNode(current, t('slots-table', 'Table')),
    ]);

  const duplicateSlot = (id: string) =>
    setNodes((current) => {
      const source = current.find((node) => node.id === id);
      if (!source) return current;
      return [
        ...current.map((node) => ({ ...node, selected: false })),
        duplicateSlotNode(current, source),
      ];
    });

  const deleteSlot = (id: string) =>
    setNodes((current) => current.filter((node) => node.id !== id));

  const updateSelected = (patch: SlotNodePatch) =>
    setNodes((current) =>
      current.map((node) =>
        node.selected ? applySlotPatch(node, patch) : node,
      ),
    );

  const arrange = () => setNodes((current) => arrangeSlotNodes(current));

  const save = useCallback(async () => {
    try {
      await onSave(nodes);
      toast({
        title: t('slots-saved'),
        description: t('slots-saved-description', { count: nodes.length }),
      });
    } catch (error) {
      toast({
        title: t('slots-save-failed'),
        description:
          error instanceof Error ? error.message : t('please-try-again-later'),
        variant: 'destructive',
      });
    }
  }, [nodes, onSave, t]);

  useEffect(() => {
    if (!onSaveActionChange) return;

    onSaveActionChange(
      <PosSaveAction isDirty={isDirty} saving={saving} onClick={save} />,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, onSaveActionChange, save, saving]);

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-lg border">
      <div className="relative min-w-0 flex-1">
        <SlotCanvas
          nodes={nodes}
          onNodesChange={handleNodesChange}
          onAdd={addSlot}
          onArrange={arrange}
        />
      </div>
      <aside className="w-72 shrink-0 border-l bg-background">
        {selected ? (
          <SlotInspector
            key={selected.id}
            node={selected}
            onChange={updateSelected}
            onBack={() => select()}
            onDuplicate={() => duplicateSlot(selected.id)}
            onDelete={() => deleteSlot(selected.id)}
          />
        ) : (
          <SlotList
            nodes={nodes}
            onSelect={select}
            onDuplicate={duplicateSlot}
            onDelete={deleteSlot}
          />
        )}
      </aside>
    </div>
  );
};
