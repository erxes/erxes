import { useState } from 'react';
import {
  IconSandbox,
  IconPlus,
  IconAlertTriangle,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Card } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { useRiskTypes, useDeleteRiskType } from '~/modules/insurance/hooks';
import { RiskTypeForm } from '~/modules/insurance/components';
import { RiskType } from '~/modules/insurance/types';

export const RiskTypesPage = () => {
  const { riskTypes, loading, refetch } = useRiskTypes();
  const { deleteRiskType, loading: deleting } = useDeleteRiskType();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskType | undefined>();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this risk type?')) {
      try {
        await deleteRiskType({ variables: { id } });
        refetch();
      } catch (error) {
        console.error('Error deleting risk type:', error);
      }
    }
  };

  const handleEdit = (risk: RiskType) => {
    setEditingRisk(risk);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingRisk(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingRisk(undefined);
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
                  <IconAlertTriangle />
                  Risk Types
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
            New Risk Type
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6">
          {loading ? (
            <p className="text-muted-foreground">Loading risk types...</p>
          ) : riskTypes.length === 0 ? (
            <div className="text-center py-12">
              <IconAlertTriangle
                size={64}
                className="mx-auto mb-4 opacity-50"
              />
              <h3 className="text-lg font-semibold mb-2">No risk types yet</h3>
              <p className="text-muted-foreground mb-4">
                Define risk types that can be covered by insurance products
              </p>
              <Button onClick={handleCreate}>
                <IconPlus size={16} />
                Create First Risk Type
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {riskTypes.map((risk) => (
                <Card
                  key={risk.id}
                  className="p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <IconAlertTriangle
                          className="text-orange-600"
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{risk.name}</h3>
                        {risk.description && (
                          <p className="text-sm text-muted-foreground">
                            {risk.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(risk)}
                      >
                        <IconEdit size={16} />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(risk.id)}
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

      <RiskTypeForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        riskType={editingRisk}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
