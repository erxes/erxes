import { useState } from 'react';
import {
  IconSandbox,
  IconPlus,
  IconFileText,
  IconShieldCheck,
  IconUsers,
  IconBuilding,
  IconPackage,
  IconAlertTriangle,
  IconArrowRight,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Card, Badge, Skeleton } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import {
  useInsuranceTypes,
  useInsuranceProducts,
  useContracts,
  useVendors,
  useVendorUsers,
  useRiskTypes,
} from '~/modules/insurance/hooks';
import { ContractForm } from '~/modules/insurance/components/ContractForm';

export const IndexPage = () => {
  const [isContractFormOpen, setIsContractFormOpen] = useState(false);
  const { insuranceTypes, loading: typesLoading } = useInsuranceTypes();
  const { insuranceProducts, loading: productsLoading } =
    useInsuranceProducts();
  const { contracts, loading: contractsLoading } = useContracts();
  const { vendors, loading: vendorsLoading } = useVendors();
  const { vendorUsers, loading: vendorUsersLoading } = useVendorUsers();
  const { riskTypes, loading: risksLoading } = useRiskTypes();

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/insurance/products">
                    <IconSandbox />
                    Insurance
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Link to="/insurance/car-insurance">
            <Button>
              <IconPlus size={16} />
              New Contract
            </Button>
          </Link>
        </PageHeader.End>
      </PageHeader>
      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6 gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/insurance/types">
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <IconShieldCheck className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Insurance Types
                    </p>
                    <p className="text-2xl font-bold">
                      {typesLoading ? (
                        <Skeleton className="h-8 w-8" />
                      ) : (
                        insuranceTypes.length
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
            {/* <Link to="/insurance/contract-templates">
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <IconShieldCheck className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Contract Template
                    </p>
                    <p className="text-2xl font-bold">
                      {contractsLoading ? '...' : contracts.length}
                    </p>
                  </div>
                </div>
              </Card>
            </Link> */}
            <Link to="/insurance/vendors">
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconBuilding className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Vendors</h3>
                      <p className="text-sm text-muted-foreground">
                        {vendorsLoading ? (
                          <Skeleton className="h-4 w-16" />
                        ) : (
                          `${vendors.length} vendors`
                        )}
                      </p>
                    </div>
                  </div>
                  <IconArrowRight size={20} className="text-muted-foreground" />
                </div>
              </Card>
            </Link>
            <Link to="/insurance/vendor-users">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <IconUsers className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Vendor Users
                    </p>
                    <p className="text-2xl font-bold">
                      {vendorUsersLoading ? (
                        <Skeleton className="h-8 w-8" />
                      ) : (
                        vendorUsers.length
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link to="/insurance/customers">
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <IconUsers className="text-cyan-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Customers</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage customers
                      </p>
                    </div>
                  </div>
                  <IconArrowRight size={20} className="text-muted-foreground" />
                </div>
              </Card>
            </Link>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* <Link to="/insurance/car-insurance">
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <IconCar className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Автомашины даатгал</h3>
                      <p className="text-sm text-muted-foreground">
                        Машины даатгал үүсгэх
                      </p>
                    </div>
                  </div>
                  <IconArrowRight size={20} className="text-muted-foreground" />
                </div>
              </Card>
            </Link> */}

            {/* <Link to="/insurance/citizen-insurance">
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <IconShieldCheck className="text-pink-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Иргэний даатгал</h3>
                      <p className="text-sm text-muted-foreground">
                        Иргэний даатгал үүсгэх
                      </p>
                    </div>
                  </div>
                  <IconArrowRight size={20} className="text-muted-foreground" />
                </div>
              </Card>
            </Link> */}

            <Link to="/insurance/products">
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <IconPackage className="text-green-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Products</h3>
                      <p className="text-sm text-muted-foreground">
                        {productsLoading ? (
                          <Skeleton className="h-4 w-20" />
                        ) : (
                          `${insuranceProducts.length} products`
                        )}
                      </p>
                    </div>
                  </div>
                  <IconArrowRight size={20} className="text-muted-foreground" />
                </div>
              </Card>
            </Link>

            <Link to="/insurance/risks">
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <IconAlertTriangle
                        className="text-orange-600"
                        size={20}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">Risk Types</h3>
                      <p className="text-sm text-muted-foreground">
                        {risksLoading ? (
                          <Skeleton className="h-4 w-16" />
                        ) : (
                          `${riskTypes.length} risks`
                        )}
                      </p>
                    </div>
                  </div>
                  <IconArrowRight size={20} className="text-muted-foreground" />
                </div>
              </Card>
            </Link>
          </div>

          {/* Recent Contracts */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Contracts</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/insurance/contracts">View All</Link>
              </Button>
            </div>
            {contractsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <IconFileText size={48} className="mx-auto mb-2 opacity-50" />
                <p>No contracts yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsContractFormOpen(true)}
                >
                  <IconPlus size={16} />
                  Create First Contract
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.slice(0, 5).map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {contract.customer.firstName}{' '}
                        {contract.customer.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contract.insuranceProduct.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        ₮{contract.chargedAmount.toLocaleString()}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/insurance/contracts/${contract.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Insurance Products */}
          {/* <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Insurance Products</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/insurance/products">Manage Products</Link>
              </Button>
            </div>
            {productsLoading ? (
              <p className="text-muted-foreground">Loading products...</p>
            ) : insuranceProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <IconShieldCheck
                  size={48}
                  className="mx-auto mb-2 opacity-50"
                />
                <p>No products configured</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {insuranceProducts.slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    className="p-4 border rounded-lg hover:border-primary transition-colors"
                  >
                    <h3 className="font-medium mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.insuranceType.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.coveredRisks.length} risks covered
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card> */}
        </div>
      </div>

      <ContractForm
        open={isContractFormOpen}
        onOpenChange={setIsContractFormOpen}
      />
    </div>
  );
};
