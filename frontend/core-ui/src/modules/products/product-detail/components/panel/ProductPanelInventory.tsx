import { Button, Form, ScrollArea } from 'erxes-ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  EMPTY_PRODUCT_FORM_VALUES,
  ProductFormValues,
} from '@/products/constants/ProductFormSchema';
import { ProductDetailBarcode } from '@/products/product-detail/components/ProductDetailBarcode';
import { getProductFormDefaultValues } from '@/products/product-detail/utils/productFormValues';
import { TProductPanelFieldsProps } from './ProductPanelFields';

const BARCODE_FIELDS = ['barcodes', 'variants', 'barcodeDescription'] as const;

type TBarcodeValues = Pick<ProductFormValues, (typeof BARCODE_FIELDS)[number]>;

const pickBarcodes = (values: ProductFormValues): TBarcodeValues => ({
  barcodes: values.barcodes,
  variants: values.variants,
  barcodeDescription: values.barcodeDescription,
});

/**
 * The Barcodes tab. A saved product's barcodes are edited a row at a time
 * (a code, then its variant's name), so they save together from the bar
 * shown while they differ from the product; a draft takes each change as
 * it is made.
 */
export const ProductPanelInventory = ({
  product,
  save,
  draft = false,
}: TProductPanelFieldsProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const defaults = useMemo(
    () => getProductFormDefaultValues(product) ?? EMPTY_PRODUCT_FORM_VALUES,
    [product],
  );
  const form = useForm<ProductFormValues>({ defaultValues: defaults });
  const [saving, setSaving] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [barcodes, variants, barcodeDescription] = useWatch({
    control: form.control,
    name: BARCODE_FIELDS,
  });
  const edited = JSON.stringify({ barcodes, variants, barcodeDescription });
  const changed = edited !== JSON.stringify(pickBarcodes(defaults));

  // Read when the product changes, not a reason to reset on its own.
  const keep = useRef(changed);
  keep.current = changed;

  // A newly loaded product replaces what is shown, unless it was edited.
  useEffect(() => {
    if (!keep.current) form.reset(defaults);
  }, [defaults, form]);

  // A draft has nothing to save yet: it takes the barcodes as they change.
  useEffect(() => {
    if (draft && keep.current) void save(pickBarcodes(form.getValues()));
  }, [draft, edited, form, save]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const savedProduct = await save(pickBarcodes(form.getValues()));
      // As saved: the server tidies barcodes.
      if (savedProduct) {
        form.reset({
          ...form.getValues(),
          ...pickBarcodes(
            getProductFormDefaultValues(savedProduct) ??
              EMPTY_PRODUCT_FORM_VALUES,
          ),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form {...form}>
      <div className="flex flex-1 min-h-0 flex-col">
        <ScrollArea
          className="flex-1 min-h-0"
          viewportClassName="[&>div]:block!"
        >
          <ProductDetailBarcode productDetail={product} resetKey={resetKey} />
        </ScrollArea>
        {changed && !draft && (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t px-3 py-2">
            <span className="mr-auto text-xs text-muted-foreground">
              {t('unsaved-changes', 'Unsaved changes')}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => {
                form.reset(defaults);
                setResetKey((key) => key + 1);
              }}
            >
              {t('cancel')}
            </Button>
            <Button type="button" disabled={saving} onClick={handleSave}>
              {saving ? t('saving') : t('save')}
            </Button>
          </div>
        )}
      </div>
    </Form>
  );
};
