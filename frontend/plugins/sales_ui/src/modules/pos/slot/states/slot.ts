import { atom } from 'jotai';
import { CustomNode, SlotDetailForm } from '../types';

export const selectedNodeAtom = atom<CustomNode | null>(null);

export const slotDetailAtom = atom<SlotDetailForm>({
  name: '',
  code: '',
  rounded: 0,
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
        rounded: Number(node.data.rounded) || 0,
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
        rounded: 0,
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
