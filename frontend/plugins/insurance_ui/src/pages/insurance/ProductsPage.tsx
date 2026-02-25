import { useState, useCallback } from 'react';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import {
  useInsuranceProducts,
  useDeleteInsuranceProduct,
} from '~/modules/insurance/hooks';
import {
  ProductForm,
  ProductsHeader,
  ProductsRecordTable,
  ProductsFilter,
} from '~/modules/insurance/components';
import { InsuranceProduct } from '~/modules/insurance/types';

export const ProductsPage = () => {
  const { refetch } = useInsuranceProducts();
  const { deleteInsuranceProduct } = useDeleteInsuranceProduct();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<
    InsuranceProduct | undefined
  >();

  const handleEdit = useCallback((product: InsuranceProduct) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };

  const handleSuccess = () => {
    refetch();
  };

  const handleDelete = useCallback(
    async (product: InsuranceProduct) => {
      if (
        window.confirm(`Are you sure you want to delete "${product.name}"?`)
      ) {
        try {
          await deleteInsuranceProduct({
            variables: { id: product.id },
          });
          refetch();
        } catch (error) {
          console.error('Error deleting product:', error);
          alert('Failed to delete product');
        }
      }
    },
    [deleteInsuranceProduct, refetch],
  );

  return (
    <PageContainer>
      <ProductsHeader onCreateClick={handleCreate} />
      <PageSubHeader>
        <ProductsFilter />
      </PageSubHeader>
      <ProductsRecordTable onEdit={handleEdit} onDelete={handleDelete} />

      <ProductForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        product={editingProduct}
        onSuccess={handleSuccess}
      />
    </PageContainer>
  );
};
