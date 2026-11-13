import { Button, Sheet, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { messageOf } from '~/lib/api';
import { useSession } from '~/modules/auth/session';
import { useProduct } from '../useProducts';
import { ProductForm } from './ProductForm';
import { useProductSheet } from './useProductSheet';

/** While the open product loads, or when it can't. */
const SheetState = ({ error, onRetry }: { error: Error | null; onRetry: () => void }) => {
  const { t } = useTranslation('product');

  return (
    <>
      <Sheet.Header>
        <Sheet.Title>{t('product', 'Product')}</Sheet.Title>
        <Sheet.Description className="sr-only">{t('product', 'Product')}</Sheet.Description>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="flex flex-col items-center justify-center gap-2 p-6 text-sm">
        {error ? (
          <>
            <p role="alert" className="text-destructive">
              {messageOf(error)}
            </p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              {t('actions.retry', 'Try again')}
            </Button>
          </>
        ) : (
          <Spinner />
        )}
      </Sheet.Content>
    </>
  );
};

/** The product open over the list (`?product=<id>` or `?product=new`). */
export const ProductSheet = () => {
  const { open, productId, close } = useProductSheet();
  const { organization } = useSession();
  const query = useProduct(productId);
  const loading = !!productId && !query.data;

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <Sheet.View className="flex w-full flex-col p-0 sm:max-w-xl">
        {loading ? (
          <SheetState error={query.error} onRetry={() => void query.refetch()} />
        ) : (
          <ProductForm
            key={productId ?? 'new'}
            product={productId ? query.data : undefined}
            currency={organization.currency}
            onClose={close}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
