import { useState } from 'react';
import { IPricingActiveWindow } from '@/pricing/types';

// Which window the sheet edits: an index, 'new', or none when closed.
type EditTarget = number | 'new' | null;

export const useScheduleEditor = ({
  windows,
  onWindowsChange,
}: {
  windows: IPricingActiveWindow[];
  onWindowsChange: (windows: IPricingActiveWindow[]) => void;
}) => {
  const [target, setTarget] = useState<EditTarget>(null);

  const editingWindow = typeof target === 'number' ? windows[target] : null;

  const save = (window: IPricingActiveWindow) => {
    onWindowsChange(
      typeof target === 'number'
        ? windows.map((item, index) => (index === target ? window : item))
        : [...windows, window],
    );
    setTarget(null);
  };

  const remove = (index: number) =>
    onWindowsChange(windows.filter((_, itemIndex) => itemIndex !== index));

  return {
    open: target !== null,
    editingWindow,
    startAdd: () => setTarget('new'),
    startEdit: (index: number) => setTarget(index),
    close: () => setTarget(null),
    save,
    remove,
  };
};
