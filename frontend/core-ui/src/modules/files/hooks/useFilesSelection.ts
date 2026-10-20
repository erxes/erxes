import { useCallback, useEffect, useMemo, useState } from 'react';
import { IFile, IFilesFolder } from 'ui-modules';

export type TFilesItem =
  | { itemType: 'file'; item: IFile }
  | { itemType: 'folder'; item: IFilesFolder };

export type TFilesSelectMode = { range?: boolean };

export const filesItemKey = ({ itemType, item }: TFilesItem) =>
  `${itemType}:${item._id}`;

export const useFilesSelection = (visible: TFilesItem[], resetKey: string) => {
  const [selected, setSelected] = useState<Map<string, TFilesItem>>(new Map());
  const [anchor, setAnchor] = useState<string | null>(null);

  const clear = useCallback(() => {
    setSelected(new Map());
    setAnchor(null);
  }, []);

  useEffect(clear, [resetKey, clear]);

  useEffect(() => {
    if (!selected.size) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && clear();

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected.size, clear]);

  const select = (target: TFilesItem, { range }: TFilesSelectMode = {}) => {
    const key = filesItemKey(target);
    const keys = visible.map(filesItemKey);
    const from = anchor ? keys.indexOf(anchor) : -1;
    const to = keys.indexOf(key);

    if (range && from !== -1 && to !== -1) {
      const [start, end] = from < to ? [from, to] : [to, from];

      setSelected((prev) => {
        const next = new Map(prev);

        visible
          .slice(start, end + 1)
          .forEach((item) => next.set(filesItemKey(item), item));

        return next;
      });

      return;
    }

    setSelected((prev) => {
      const next = new Map(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, target);
      }

      return next;
    });
    setAnchor(key);
  };

  const items = useMemo(() => [...selected.values()], [selected]);
  const allSelected =
    !!visible.length &&
    visible.every((item) => selected.has(filesItemKey(item)));

  return {
    items,
    count: items.length,
    fileIds: items.flatMap((i) => (i.itemType === 'file' ? [i.item._id] : [])),
    folderIds: items.flatMap((i) =>
      i.itemType === 'folder' ? [i.item._id] : [],
    ),
    isSelected: (target: TFilesItem) => selected.has(filesItemKey(target)),
    allSelected,
    select,
    toggleAll: () =>
      allSelected
        ? clear()
        : setSelected(
            new Map(visible.map((item) => [filesItemKey(item), item])),
          ),
    clear,
  };
};
