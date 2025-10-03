import { atom } from 'jotai';
import { CustomNode, SlotDetailForm } from '../types';

export const selectedNodeAtom = atom<CustomNode | null>(null);

export const slotDetailAtom = atom<SlotDetailForm>({
  name: '',
  code: '',
  rounded: false,
  width: '80',
  height: '80',
  top: '0',
  left: '0',
  rotateAngle: '0',
  zIndex: '0',
  color: '#5E5CFF',
  disabled: false,
  label: '',
});

export const sidebarViewAtom = atom<'list' | 'detail' | 'hidden'>('list');
export const isFullscreenAtom = atom<boolean>(false);

export const syncSelectedNodeAtom = atom(
  (get) => get(selectedNodeAtom),
  (get, set, node: CustomNode | null) => {
    set(selectedNodeAtom, node);

    if (node) {
      const x = node.position?.x ?? node.data.positionX ?? 0;
      const y = node.position?.y ?? node.data.positionY ?? 0;

      set(slotDetailAtom, {
        name: node.data.label || '',
        code: node.data.code || node.id,
        rounded: node.data.rounded || false,
        width: node.data.width ? String(node.data.width) : '80',
        height: node.data.height ? String(node.data.height) : '80',
        top: String(y),
        left: String(x),
        rotateAngle: node.data.rotateAngle
          ? String(node.data.rotateAngle)
          : '0',
        zIndex: node.data.zIndex ? String(node.data.zIndex) : '0',
        color: node.data.color || '#5E5CFF',
        disabled: node.data.disabled || false,
        label: node.data.label || '',
      });
    } else {
      set(slotDetailAtom, {
        name: '',
        code: '',
        rounded: false,
        width: '80',
        height: '80',
        top: '0',
        left: '0',
        rotateAngle: '0',
        zIndex: '0',
        color: '#5E5CFF',
        disabled: false,
        label: '',
      });
    }
  },
);

export const syncSlotDetailAtom = atom(
  (get) => get(slotDetailAtom),
  (get, set, detail: SlotDetailForm) => {
    set(slotDetailAtom, detail);

    const selectedNode = get(selectedNodeAtom);
    if (selectedNode) {
      const x = Number(detail.left) || 0;
      const y = Number(detail.top) || 0;
      const width = Number(detail.width) || 80;
      const height = Number(detail.height) || 80;
      const rotateAngle = Number(detail.rotateAngle) || 0;
      const zIndex = Number(detail.zIndex) || 0;

      const updatedNode: CustomNode = {
        ...selectedNode,
        position: { x, y },
        width,
        height,
        data: {
          ...selectedNode.data,
          label: detail.name || detail.label,
          code: detail.code,
          color: detail.color,
          width,
          height,
          positionX: x,
          positionY: y,
          rounded: detail.rounded,
          rotateAngle,
          zIndex,
          disabled: detail.disabled,
        },
      };

      set(selectedNodeAtom, updatedNode);
    }
  },
);

export const currentPositionAtom = atom((get) => {
  const selectedNode = get(selectedNodeAtom);
  if (!selectedNode) return { x: 0, y: 0 };

  const x = selectedNode.position?.x ?? selectedNode.data.positionX ?? 0;
  const y = selectedNode.position?.y ?? selectedNode.data.positionY ?? 0;

  return { x, y };
});
