import { useCallback, useEffect, useState } from 'react';
import { TStructureTreeEntity } from '../types/structureEntity';
import { getStructureAncestorIds } from '../utils/structureTree';

export const useStructureTreeExpansion = (
  selected?: Pick<TStructureTreeEntity, '_id' | 'order'>,
) => {
  const [toggled, setToggled] = useState<Map<string, boolean>>(new Map());
  const selectedId = selected?._id;
  const selectedOrder = selected?.order;

  useEffect(() => {
    if (!selectedId || !selectedOrder) {
      return;
    }

    const ancestorIds = getStructureAncestorIds({
      _id: selectedId,
      order: selectedOrder,
    });

    setToggled((prev) =>
      ancestorIds.every((id) => prev.get(id))
        ? prev
        : new Map([
            ...prev,
            ...ancestorIds.map((id): [string, boolean] => [id, true]),
          ]),
    );
  }, [selectedId, selectedOrder]);

  const isExpanded = useCallback(
    (entity: TStructureTreeEntity, depth: number) =>
      toggled.get(entity._id) ?? depth === 0,
    [toggled],
  );

  const toggle = useCallback(
    (id: string, expanded: boolean) =>
      setToggled((prev) => new Map(prev).set(id, !expanded)),
    [],
  );

  const expand = useCallback(
    (id: string) => setToggled((prev) => new Map(prev).set(id, true)),
    [],
  );

  return { isExpanded, toggle, expand };
};
