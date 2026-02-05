import { useState } from 'react';
import {
  IconSandbox,
  IconPlus,
  IconShieldCheck,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Card, Badge } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import {
  useInsuranceTypes,
  useDeleteInsuranceType,
} from '~/modules/insurance/hooks';
import { InsuranceTypeForm } from '~/modules/insurance/components';
import { InsuranceType } from '~/modules/insurance/types';

export const InsuranceTypesPage = () => {
  const { insuranceTypes, loading, refetch } = useInsuranceTypes();
  const { deleteInsuranceType, loading: deleting } = useDeleteInsuranceType();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<InsuranceType | undefined>();

  const handleDelete = async (id: string) => {
    if (
      window.confirm('Are you sure you want to delete this insurance type?')
    ) {
      try {
        await deleteInsuranceType({ variables: { id } });
        refetch();
      } catch (error) {
        console.error('Error deleting insurance type:', error);
      }
    }
  };

  const handleEdit = (type: InsuranceType) => {
    setEditingType(type);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingType(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingType(undefined);
  };

  const handleSuccess = () => {
    refetch();
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
                  <IconShieldCheck />
                  Insurance Types
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
            New Insurance Type
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6">
          {loading ? (
            <p className="text-muted-foreground">Loading insurance types...</p>
          ) : insuranceTypes.length === 0 ? (
            <div className="text-center py-12">
              <IconShieldCheck size={64} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                No insurance types yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create insurance types to categorize your insurance products
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/insurance">Back to Dashboard</Link>
                </Button>
                <Button onClick={handleCreate}>
                  <IconPlus size={16} />
                  Create First Insurance Type
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {insuranceTypes.map((type) => (
                <Card
                  key={type.id}
                  className="p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconShieldCheck className="text-blue-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{type.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {type.attributes.length} attributes
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(type)}
                      >
                        <IconEdit size={16} />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(type.id)}
                        disabled={deleting}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <InsuranceTypeForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        insuranceType={editingType}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
