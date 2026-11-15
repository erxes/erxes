import { useState } from 'react';
import { Button, Empty, Form, InfoCard, Spinner } from 'erxes-ui';
import { IconLayoutGrid, IconLoader2, IconPlus } from '@tabler/icons-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useFields, useSidePanel } from 'ui-modules';
import { ProductDetail } from '@/products/product-detail/types/detailTypes';
import { buildProductSimilarityDraft } from '@/products/product-detail/utils/similarityDraft';
import {
  SIMILARITY_CONTENT_TYPE,
  type TSimilarityDraftDefaults,
} from '@/products/bulk-similarity/constants/similarityContentType';
import { useProductSimilarity } from '@/products/bulk-similarity/hooks/useProductSimilarityDetail';
import { useBulkProductForm } from '@/products/bulk-similarity/hooks/useBulkProductForm';
import { useEditSimilarity } from '@/products/bulk-similarity/hooks/useEditSimilarity';
import { useBulkRows } from '@/products/bulk-similarity/hooks/useBulkRows';
import { BulkSimilarityFormValues } from '@/products/bulk-similarity/constants/bulkSimilaritySchema';
import { GeneratedProductsTable } from '@/products/bulk-similarity/components/GeneratedProductsTable';
import {
  VariantFieldAddButton,
  VariantFieldAddView,
  VariantFieldPicker,
} from '@/products/bulk-similarity/components/VariantFieldPicker';
import { useTranslation } from 'react-i18next';

interface ProductDetailSimilarityProps {
  product?: ProductDetail | null;
  // Shown, never changed: no field is added, nothing is saved or created.
  readOnly?: boolean;
}

const ProductsWithUnitPrice = ({
  fieldName,
  disabled,
}: {
  fieldName: (id: string) => string;
  disabled: boolean;
}) => {
  const { control } = useFormContext<BulkSimilarityFormValues>();
  const unitPrice = useWatch({ control, name: 'unitPrice' });
  return (
    <GeneratedProductsTable
      fieldName={fieldName}
      unitPrice={unitPrice}
      disabled={disabled}
    />
  );
};

// Save, held back while the generated rows cannot be saved (duplicate codes),
// as in the similarity group's own panel.
const SimilaritySaveButton = ({
  saving,
  onClick,
}: {
  saving: boolean;
  onClick: () => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const { validation } = useBulkRows();

  return (
    <Button
      type="button"
      disabled={saving || !validation.canSave}
      onClick={onClick}
    >
      {saving && <IconLoader2 size={16} className="animate-spin" />}
      {saving ? t('saving') : t('save')}
    </Button>
  );
};

/**
 * A product's similarity group: edited here once the product is in one.
 * Otherwise a new group starts from the product as a draft stacked in the
 * side panel; Back returns to the product.
 */
export const ProductDetailSimilarity = ({
  product,
  readOnly = false,
}: ProductDetailSimilarityProps) => {
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  const { fields } = useFields({ contentType: 'core:product' });
  const { openNewRecord } = useSidePanel();
  const [addingField, setAddingField] = useState(false);

  const similarity = product?.similarity;

  const { similarity: fullSimilarity, loading } = useProductSimilarity(
    similarity?._id,
  );
  const { form, buildSavePayload } = useBulkProductForm(fullSimilarity);
  const { edit, loading: saving } = useEditSimilarity();

  const fieldName = (fieldId: string) =>
    fields.find((f) => f._id === fieldId)?.name || fieldId;

  if (!similarity) {
    return (
      <div className="flex-1 overflow-auto p-4">
        <Empty className="my-8">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconLayoutGrid />
            </Empty.Media>
            <Empty.Title>{t('not-in-similarity-group')}</Empty.Title>
            <Empty.Description>
              {t('not-in-similarity-description')}
            </Empty.Description>
          </Empty.Header>
          {product && !readOnly && (
            <Empty.Content>
              <Button
                onClick={() => {
                  const defaults: TSimilarityDraftDefaults = {
                    similarity: buildProductSimilarityDraft(product, fields),
                  };
                  openNewRecord(SIMILARITY_CONTENT_TYPE, defaults, {
                    stack: true,
                  });
                }}
              >
                <IconPlus />
                {t('create-similarity-group')}
              </Button>
            </Empty.Content>
          )}
        </Empty>
      </div>
    );
  }

  if (loading || !fullSimilarity) {
    return <Spinner />;
  }

  const handleSave = async (values: BulkSimilarityFormValues) => {
    await edit(fullSimilarity._id, buildSavePayload(values));
  };

  return (
    <Form {...form}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
          <div className="relative">
            <InfoCard title={t('property-fields')}>
              <InfoCard.Content>
                {addingField ? (
                  <VariantFieldAddView onDone={() => setAddingField(false)} />
                ) : (
                  <VariantFieldPicker />
                )}
              </InfoCard.Content>
            </InfoCard>
            {!addingField && !readOnly && (
              <div className="absolute top-0.5 right-3">
                <VariantFieldAddButton onClick={() => setAddingField(true)} />
              </div>
            )}
          </div>

          <InfoCard title={t('products')}>
            <InfoCard.Content>
              <ProductsWithUnitPrice
                fieldName={fieldName}
                disabled={readOnly || saving}
              />
            </InfoCard.Content>
          </InfoCard>
        </div>

        {!readOnly && (
          <div className="flex justify-end p-4 space-x-2 border-t bg-background">
            <SimilaritySaveButton
              saving={saving}
              onClick={() => form.handleSubmit(handleSave)()}
            />
          </div>
        )}
      </div>
    </Form>
  );
};
