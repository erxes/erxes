import { useState } from 'react';
import {
  IconSandbox,
  IconPlus,
  IconPackage,
  IconShieldCheck,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Card, Badge } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import {
  useInsuranceProducts,
  useDeleteInsuranceProduct,
} from '~/modules/insurance/hooks';
import { ProductForm } from '~/modules/insurance/components';
import { InsuranceProduct } from '~/modules/insurance/types';

export const ProductsPage = () => {
  const { insuranceProducts, loading, refetch } = useInsuranceProducts();
  const { deleteInsuranceProduct, loading: deleting } =
    useDeleteInsuranceProduct();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<
    InsuranceProduct | undefined
  >();

  const handleEdit = (product: InsuranceProduct) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };

  const handleSuccess = () => {
    refetch();
  };

  const handleDelete = async (product: InsuranceProduct) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
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
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/insurance">
                    <IconSandbox />
                    Insurance
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost">
                  <IconPackage />
                  Products
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button onClick={handleCreate}>
            <IconPlus size={16} />
            New Product
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6">
          {loading ? (
            <p className="text-muted-foreground">Loading products...</p>
          ) : insuranceProducts.length === 0 ? (
            <div className="text-center py-12">
              <IconPackage size={64} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                No insurance products yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first insurance product to get started
              </p>
              <Button onClick={handleCreate}>
                <IconPlus size={16} />
                Create First Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insuranceProducts.map((product) => (
                <Card
                  key={product.id}
                  className="p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <IconPackage className="text-green-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {product.insuranceType.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IconShieldCheck
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="text-sm">
                        {product.coveredRisks.length} risks covered
                      </span>
                    </div>

                    {product.coveredRisks.length > 0 && (
                      <div className="space-y-1">
                        {product.coveredRisks.slice(0, 3).map((cr) => (
                          <div
                            key={cr.risk.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {cr.risk.name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {cr.coveragePercentage}%
                            </Badge>
                          </div>
                        ))}
                        {product.coveredRisks.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{product.coveredRisks.length - 3} more risks
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(product)}
                    >
                      <IconEdit size={16} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product)}
                      disabled={deleting}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        product={editingProduct}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
