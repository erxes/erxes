import { useToast } from 'erxes-ui';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IPackage } from '../types/Package';
import { toPackageProductsInput } from '../utils/packagePricing';
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

  const save = useCallback(
    (patch: TPackagePatch) => {
      const next = queue.current.then(() => saveNow(patch));
      // A failed save must not stop the ones queued after it.
      queue.current = next.catch(() => null);
      return next;
    },
    [saveNow],
  );

  return { save };
};
