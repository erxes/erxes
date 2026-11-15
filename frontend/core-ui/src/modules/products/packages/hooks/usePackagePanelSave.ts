import { useToast } from 'erxes-ui';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IPackage, IPackageProduct } from '../types/Package';
import {
  priceFromPercent,
  toPackageProductsInput,
} from '../utils/packagePricing';
import { useEditPackage } from './usePackageMutations';

export type TPackagePatch = Partial<
  Pick<
    IPackage,
    | 'name'
    | 'description'
    | 'coverImage'
    | 'products'
    | 'tagIds'
    | 'price'
    | 'percent'
    | 'status'
  >
>;

// The price a saved package's products give at its discount, or `null` when
// it already has it (or has no total). A total of 0 prices it at 0.
const followingPrice = (saved: IPackage): number | null => {
  const price =
    saved.totalPrice === 0
      ? 0
      : priceFromPercent(saved.totalPrice, saved.percent);
  return price === saved.price ? null : price;
};

/**
 * Saves one change to the package shown in the side panel.
 * `productPackagesEdit` sets only the fields it is sent, so each save sends
 * just the change. Saves run one at a time, so quick edits (e.g. a quantity
 * stepped up and down) reach the package in order. Resolves the saved
 * package, or `null`.
 */
export const usePackagePanelSave = (packageId: string) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const { toast } = useToast();
  const { editPackage } = useEditPackage(packageId);
  const queue = useRef<Promise<IPackage | null>>(Promise.resolve(null));

  const saveNow = useCallback(
    async ({ products, ...patch }: TPackagePatch): Promise<IPackage | null> => {
      try {
        const { data } = await editPackage({
          variables: {
            _id: packageId,
            ...patch,
            ...(products ? { products: toPackageProductsInput(products) } : {}),
          },
        });
        return (data?.productPackagesEdit as IPackage | undefined) ?? null;
      } catch (error) {
        toast({
          variant: 'destructive',
          title: t('update-failed', 'Failed to update package'),
          description: (error as Error).message,
        });
        return null;
      }
    },
    [editPackage, packageId, t, toast],
  );

  // Runs `task` after the saves queued before it.
  const enqueue = useCallback((task: () => Promise<IPackage | null>) => {
    const next = queue.current.then(task);
    // A failed save must not stop the ones queued after it.
    queue.current = next.catch(() => null);
    return next;
  }, []);

  const save = useCallback(
    (patch: TPackagePatch) => enqueue(() => saveNow(patch)),
    [enqueue, saveNow],
  );

  // Products, then the price their new total gives at the discount, as one
  // queued step: a price or discount change made meanwhile comes after both.
  const saveProducts = useCallback(
    (products: IPackageProduct[]) =>
      enqueue(async () => {
        const saved = await saveNow({ products });
        if (!saved) return null;
        const price = followingPrice(saved);
        return price === null ? saved : saveNow({ price });
      }),
    [enqueue, saveNow],
  );

  return { save, saveProducts };
};
