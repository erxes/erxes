import { getProductsDataPatches } from '@/deals/cards/components/detail/product/utils/productsDataPatches';
import type { DealProductData } from '@/deals/utils/dealJson';
import { SetStateAction, useCallback, useRef, useState } from 'react';

type TProductPatches = Record<string, Partial<DealProductData>>;

export const useLocalProductEdits = (productsData: DealProductData[]) => {
  const [localProductsData, setLocalProductsData] =
    useState<DealProductData[]>(productsData);
  const pendingProductPatchesRef = useRef<TProductPatches>({});
  const savedPatchesRef = useRef<TProductPatches>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const editRevisionRef = useRef(0);
  const savedRevisionRef = useRef<number | null>(null);

  const addPendingPatches = useCallback((patches: TProductPatches) => {
    Object.entries(patches).forEach(([id, patch]) => {
      pendingProductPatchesRef.current[id] = {
        ...pendingProductPatchesRef.current[id],
        ...patch,
      };
    });
  }, []);

  const editLocalProductsData = useCallback(
    (update: SetStateAction<DealProductData[]>) => {
      editRevisionRef.current += 1;
      setHasUnsavedChanges(true);
      setLocalProductsData((prev) => {
        const next = typeof update === 'function' ? update(prev) : update;
        addPendingPatches(getProductsDataPatches(next, prev));
        return next;
      });
    },
    [addPendingPatches],
  );

  const beginSave = useCallback(() => {
    savedRevisionRef.current = editRevisionRef.current;
    savedPatchesRef.current = { ...pendingProductPatchesRef.current };
  }, []);

  const completeSave = useCallback(() => {
    Object.entries(savedPatchesRef.current).forEach(([id, patch]) => {
      if (pendingProductPatchesRef.current[id] === patch) {
        delete pendingProductPatchesRef.current[id];
      }
    });
    savedPatchesRef.current = {};

    if (editRevisionRef.current === savedRevisionRef.current) {
      setHasUnsavedChanges(false);
    }
  }, []);

  return {
    localProductsData,
    setLocalProductsData,
    editLocalProductsData,
    addPendingPatches,
    pendingProductPatchesRef,
    hasUnsavedChanges,
    beginSave,
    completeSave,
  };
};
