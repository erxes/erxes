import type { Product } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconArchive, IconRestore } from '@tabler/icons-react';
import { Badge, Button, Form, Sheet, Spinner, useToast } from 'erxes-ui';
import { useState } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { messageOf } from '~/lib/api';
import {
  useCanManageProducts,
  useProductCreate,
  useProductStatus,
  useProductUpdate,
} from '../useProducts';
import { type ProductFieldError, productFieldError } from './productErrors';
import {
  productFormSchema,
  productFormValues,
  productInput,
  type ProductFormValues,
} from './productFormValues';
import { ProductFormFields } from './ProductFormFields';
import { ProductImagesField } from './ProductImagesField';
import { ProductPluginsField, ProductPropertiesField } from './ProductUsageFields';

/** Creates or updates; failures about one field show under it, others in a toast. */
const useProductSave = (
  form: UseFormReturn<ProductFormValues>,
  product: Product | undefined,
  onSaved: () => void,
) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const create = useProductCreate();
  const update = useProductUpdate();
  const [saveError, setSaveError] = useState<ProductFieldError | null>(null);

  const save = form.handleSubmit(async (values) => {
    setSaveError(null);

    try {
      const input = productInput(values);

      const saved = product
        ? await update.mutateAsync({ id: product.id, ...input })
        : await create.mutateAsync(input);

      toast({
        variant: 'success',
        title: t('saved-toast', '{{name}} saved', { name: saved.name }),
      });
      onSaved();
    } catch (error) {
      const fieldError = productFieldError(error, t);

      if (fieldError) {
        form.setError(fieldError.field, { message: fieldError.message });
        setSaveError(fieldError);

        return;
      }

      toast({
        variant: 'destructive',
        title: t('save-failed', 'Could not save the product'),
        description: messageOf(error),
      });
    }
  });

  return { save, saving: create.isPending || update.isPending, saveError };
};

/** Archive (out of lists and pickers) or restore. */
const ProductStatusButton = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');
  const { archive, restore } = useProductStatus();
  const archived = product.status === 'archived';
  const pending = archive.isPending || restore.isPending;

  return (
    <Button
      type="button"
      variant="ghost"
      className="mr-auto"
      disabled={pending}
      onClick={() =>
        archived ? restore.mutate({ id: product.id }) : archive.mutate({ id: product.id })
      }
    >
      {archived ? <IconRestore /> : <IconArchive />}
      {archived ? t('actions.restore', 'Restore') : t('actions.archive', 'Archive')}
    </Button>
  );
};

/** A product's fields in the sheet: read only without `products.manage`. */
export const ProductForm = ({
  product,
  currency,
  onClose,
}: {
  product?: Product;
  /** A new product's currency: the organisation's. */
  currency: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('product');
  const manage = useCanManageProducts();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema(t)),
    defaultValues: productFormValues(product, currency),
  });

  const { save, saving, saveError } = useProductSave(form, product, onClose);
  const title = product ? product.name : t('new-product', 'New product');

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => void save(event)}
        noValidate
        className="flex h-full min-h-0 flex-col"
      >
        <Sheet.Header>
          <Sheet.Title className="flex min-w-0 items-center gap-2">
            <span className="truncate">{title}</span>
            {product?.status === 'archived' && (
              <Badge variant="secondary">{t('status.archived', 'Archived')}</Badge>
            )}
          </Sheet.Title>
          <Sheet.Description className="sr-only">{title}</Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="min-h-0 overflow-y-auto px-5 py-4">
          <fieldset disabled={!manage || saving} className="flex min-w-0 flex-col gap-4">
            <ProductImagesField disabled={!manage} />
            <ProductFormFields saveError={saveError} />
            <ProductPluginsField disabled={!manage} />
            <ProductPropertiesField
              scope={`product-sheet.${product?.id ?? 'new'}`}
              saved={product?.customFields ?? {}}
            />
          </fieldset>
        </Sheet.Content>
        <Sheet.Footer className="flex items-center justify-end gap-2 bg-background">
          {product && manage && <ProductStatusButton product={product} />}
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            {manage ? t('actions.cancel', 'Cancel') : t('actions.close', 'Close')}
          </Button>
          {manage && (
            <Button type="submit" disabled={saving}>
              {saving && <Spinner size="sm" />}
              {product ? t('actions.save', 'Save') : t('actions.create', 'Create product')}
            </Button>
          )}
        </Sheet.Footer>
      </form>
    </Form>
  );
};
