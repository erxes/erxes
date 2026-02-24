import { useState } from 'react';
import {
  IconSandbox,
  IconPlus,
  IconUsers,
  IconUser,
  IconEdit,
  IconTrash,
  IconBuilding,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Card, Badge } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { useCustomers } from '~/modules/insurance/hooks';
import { CustomerForm } from '~/modules/insurance/components';
import { InsuranceCustomer } from '~/modules/insurance/types';

export const CustomersPage = () => {
  const { customers, loading, refetch } = useCustomers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<
    InsuranceCustomer | undefined
  >();

  const handleEdit = (customer: InsuranceCustomer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingCustomer(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCustomer(undefined);
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
                  <IconUsers />
                  Харилцагчид
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
            Шинэ харилцагч
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6">
          {loading ? (
            <p className="text-muted-foreground">Ачаалж байна...</p>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <IconUsers size={64} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                Харилцагч байхгүй байна
              </h3>
              <p className="text-muted-foreground mb-4">
                Эхний харилцагчаа үүсгэнэ үү
              </p>
              <Button onClick={handleCreate}>
                <IconPlus size={16} />
                Харилцагч үүсгэх
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map((customer) => (
                <Card
                  key={customer.id}
                  className="p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {customer.type === 'company' ? (
                          <IconBuilding className="text-blue-600" size={24} />
                        ) : (
                          <IconUser className="text-blue-600" size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {customer.registrationNumber}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {customer.type === 'company' ? 'Байгууллага' : 'Хувь хүн'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    {customer.email && (
                      <p className="text-muted-foreground">{customer.email}</p>
                    )}
                    {customer.phone && (
                      <p className="text-muted-foreground">{customer.phone}</p>
                    )}
                    {customer.companyName && (
                      <p className="font-medium">{customer.companyName}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(customer)}
                    >
                      <IconEdit size={16} />
                      Засах
                    </Button>
                    <Button variant="outline" size="sm">
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <CustomerForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        customer={editingCustomer}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
