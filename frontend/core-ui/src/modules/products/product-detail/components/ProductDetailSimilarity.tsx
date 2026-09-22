import { useState } from 'react';
import { Button, Empty, Form, InfoCard, Spinner } from 'erxes-ui';
import { IconLayoutGrid, IconLoader2, IconPlus } from '@tabler/icons-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useFields } from 'ui-modules';
import { ProductDetail } from '@/products/product-detail/types/detailTypes';
import { ProductSimilarityCreateSheet } from '@/products/product-detail/components/ProductSimilarityCreateSheet';
import { useProductSimilarity } from '@/products/bulk-similarity/hooks/useProductSimilarityDetail';
import { useBulkProductForm } from '@/products/bulk-similarity/hooks/useBulkProductForm';
import { useEditSimilarity } from '@/products/bulk-similarity/hooks/useEditSimilarity';
import { BulkSimilarityFormValues } from '@/products/bulk-similarity/constants/bulkSimilaritySchema';
import { GeneratedProductsTable } from '@/products/bulk-similarity/components/GeneratedProductsTable';
import {
  VariantFieldAddButton,
  VariantFieldPicker,
} from '@/products/bulk-similarity/components/VariantFieldPicker';

interface ProductDetailSimilarityProps {
  product?: ProductDetail | null;
  callBack?: () => void;
}

const ProductsWithUnitPrice = ({
  fieldName,
}: {
  fieldName: (id: string) => string;
}) => {
  const { control } = useFormContext<BulkSimilarityFormValues>();
  const unitPrice = useWatch({ control, name: 'unitPrice' });
  return <GeneratedProductsTable fieldName={fieldName} unitPrice={unitPrice} />;
};

export const ProductDetailSimilarity = ({
  product,
  callBack,
}: ProductDetailSimilarityProps) => {
  const { fields } = useFields({ contentType: 'core:product' });
  const [createOpen, setCreateOpen] = useState(false);

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
            <Empty.Title>Not part of a similarity group</Empty.Title>
            <Empty.Description>
              This product isn't linked to a similarity group. Create one to
              generate and manage variants together, prefilled from this
              product.
            </Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button onClick={() => setCreateOpen(true)}>
              <IconPlus />
              Create similarity group
            </Button>
          </Empty.Content>
        </Empty>
        <ProductSimilarityCreateSheet
          open={createOpen}
          onOpenChange={setCreateOpen}
          product={product}
          callBack={callBack}
        />
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
            <InfoCard title="Property fields">
              <InfoCard.Content>
                <VariantFieldPicker />
              </InfoCard.Content>
            </InfoCard>
            <div className="absolute top-0.5 right-3">
              <VariantFieldAddButton />
            </div>
          </div>

          <InfoCard title="Products">
            <InfoCard.Content>
              <ProductsWithUnitPrice fieldName={fieldName} />
            </InfoCard.Content>
          </InfoCard>
        </div>

        <div className="flex justify-end p-4 space-x-2 border-t bg-background">
          <Button
            type="button"
            disabled={saving}
            onClick={() => form.handleSubmit(handleSave)()}
          >
            {saving && <IconLoader2 size={16} className="animate-spin" />}
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Form>
  );
};
