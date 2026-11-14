import { useMutation } from '@tanstack/react-query';
import { Button, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';
import { useOpenProduct, useStoreProduct } from '../useProducts';
import { productFieldError } from './productErrors';

/**
 * Saves the fields a member changed in the panel (only those). A failure shows
 * in a toast; a code or barcode another product has links to that product.
 */
export const useProductEdit = () => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const { openProduct } = useOpenProduct();
  const store = useStoreProduct();

  return useMutation(
    orpc.products.update.mutationOptions({
      onSuccess: store,
      onError: (error) => {
        const fieldError = productFieldError(error, t);
        const existingId = fieldError?.productId;

        toast({
          variant: 'destructive',
          title: t('save-failed', 'Could not save the product'),
          description: fieldError?.message ?? messageOf(error),
          action: existingId ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openProduct(existingId, { stack: true })}
            >
              {t('form.open-existing', 'Open that product')}
            </Button>
          ) : undefined,
        });
      },
    }),
  );
};
