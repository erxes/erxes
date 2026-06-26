import { useParams, Link } from 'react-router-dom';
import {
  IconFileText,
  IconDownload,
  IconCalendar,
  IconCurrencyTugrik,
  IconUser,
  IconBuilding,
  IconPackage,
  IconPrinter,
  IconEdit,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Card, Badge, Skeleton } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { useContract } from '~/modules/insurance/hooks';
import {
  generateContractPDF,
  downloadContractHTML,
} from '~/utils/contractPdfGenerator';
import { useTranslation } from 'react-i18next';

export const ContractDetailPage = () => {
  const { t } = useTranslation('insurance');
  const { id } = useParams<{ id: string }>();
  const { contract, loading } = useContract(id!);

  const handlePrintPDF = () => {
    if (!contract) return;
    generateContractPDF(contract);
  };

  const handleDownloadHTML = () => {
    if (!contract) return;
    downloadContractHTML(contract);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
              </div>
            </Card>
          </div>
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-5 w-48" />
          </Card>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>{t('contract-not-found')}</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">{t('active')}</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">{t('expired')}</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">{t('cancelled-label')}</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">{t('pending-label')}</Badge>;
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
                  <Link to="/insurance/products">
                    <IconFileText />
                    {t('insurance')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/insurance/contracts">{t('contracts')}</Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost">{contract.contractNumber}</Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to={`/insurance/contracts/${id}/pdf`}>
              <IconEdit size={16} />
              {t('edit-pdf')}
            </Link>
          </Button>
          <Button onClick={handlePrintPDF} variant="outline">
            <IconPrinter size={16} />
            {t('print-pdf')}
          </Button>
          <Button onClick={handleDownloadHTML}>
            <IconDownload size={16} />
            {t('download-html')}
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Contract Header */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    {contract.contractNumber}
                  </h1>
                  <p className="text-muted-foreground">
                    {contract.insuranceType?.name}
                  </p>
                </div>
                {getStatusBadge(contract.paymentStatus)}
              </div>
            </Card>

            {/* Customer & Vendor Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconUser className="text-blue-600" size={20} />
                  </div>
                  <h3 className="font-semibold">{t('customer')}</h3>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">
                    {contract.customer?.firstName} {contract.customer?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {contract.customer?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {contract.customer?.phone}
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <IconBuilding className="text-green-600" size={20} />
                  </div>
                  <h3 className="font-semibold">{t('insurance-company')}</h3>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">{contract.vendor?.name}</p>
                </div>
              </Card>
            </div>

            {/* Product Info */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <IconPackage className="text-purple-600" size={20} />
                </div>
                <h3 className="font-semibold">{t('product')}</h3>
              </div>
              <p className="font-medium">{contract.insuranceProduct?.name}</p>
            </Card>

            {/* Contract Period */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <IconCalendar className="text-orange-600" size={20} />
                </div>
                <h3 className="font-semibold">{t('insurance-period')}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('start-date')}</p>
                  <p className="font-medium">
                    {new Date(contract.startDate).toLocaleDateString('mn-MN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('end-date')}</p>
                  <p className="font-medium">
                    {new Date(contract.endDate).toLocaleDateString('mn-MN')}
                  </p>
                </div>
              </div>
            </Card>

            {/* Payment Info */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <IconCurrencyTugrik className="text-cyan-600" size={20} />
                </div>
                <h3 className="font-semibold">{t('payment-information')}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('premium')}:</span>
                  <span className="font-medium">
                    {contract.chargedAmount?.toLocaleString()} ₮
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('payment-method')}:</span>
                  <span className="font-medium">
                    {contract.paymentKind === 'cash' ? t('cash') : t('qpay')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('status')}:</span>
                  {getStatusBadge(contract.paymentStatus)}
                </div>
              </div>
            </Card>

            {/* Insured Object */}
            {contract.insuredObject && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">{t('insured-object')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(contract.insuredObject).map(
                    ([key, value]) => (
                      <div key={key}>
                        <p className="text-sm text-muted-foreground capitalize">
                          {key}
                        </p>
                        <p className="font-medium">
                          {typeof value === 'boolean'
                            ? value
                              ? t('yes')
                              : t('no')
                            : String(value)}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
