import { useState } from 'react';
import {
  IconSandbox,
  IconPlus,
  IconFileText,
  IconUser,
  IconCalendar,
  IconCurrencyTugrik,
  IconEye,
  IconEdit,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Card, Badge } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { useContracts } from '~/modules/insurance/hooks';
import { ContractForm } from '~/modules/insurance/components';
import { InsuranceContract } from '~/modules/insurance/types';

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('mn-MN');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('mn-MN').format(amount) + '₮';
};

const getPaymentStatusBadge = (status: string) => {
  if (status === 'paid') {
    return <Badge className="bg-green-100 text-green-800">Төлсөн</Badge>;
  }
  return <Badge className="bg-yellow-100 text-yellow-800">Хүлээгдэж буй</Badge>;
};

export const ContractsPage = () => {
  const { contracts, loading, refetch } = useContracts();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreate = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
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
                  <IconFileText />
                  Contracts
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Link to="/insurance/car-insurance">
            <IconPlus size={16} />
            Шинэ гэрээ
          </Link>
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6">
          {loading ? (
            <p className="text-muted-foreground">Гэрээнүүд ачаалж байна...</p>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <IconFileText size={64} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                Гэрээ байхгүй байна
              </h3>
              <p className="text-muted-foreground mb-4">
                Эхний даатгалын гэрээгээ үүсгэнэ үү
              </p>
              <Button onClick={handleCreate}>
                <IconPlus size={16} />
                Гэрээ үүсгэх
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contracts.map((contract) => (
                <Card
                  key={contract.id}
                  className="p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconFileText className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {contract.contractNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {contract.insuranceProduct?.name}
                        </p>
                      </div>
                    </div>
                    {getPaymentStatusBadge(contract.paymentStatus)}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IconUser size={16} className="text-muted-foreground" />
                      <span className="text-sm">
                        {contract.customer?.firstName}{' '}
                        {contract.customer?.lastName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <IconCurrencyTugrik
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="text-sm font-medium">
                        {formatCurrency(contract.chargedAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <IconCalendar
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="text-sm">
                        {formatDate(contract.startDate)} -{' '}
                        {formatDate(contract.endDate)}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Vendor:</span>{' '}
                      {contract.vendor?.name}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/insurance/contracts/${contract.id}`}>
                        <IconEye size={16} />
                        Дэлгэрэнгүй
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/insurance/contracts/${contract.id}/pdf`}>
                        <IconEdit size={16} />
                        Edit PDF
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ContractForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
