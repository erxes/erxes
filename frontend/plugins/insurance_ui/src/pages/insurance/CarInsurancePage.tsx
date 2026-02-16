import { useState } from 'react';
import { IconCar, IconCalendar, IconCurrencyTugrik } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Separator,
  Card,
  Input,
  Select,
  DatePicker,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link, useNavigate } from 'react-router-dom';
import {
  useVendors,
  useCustomers,
  useInsuranceProducts,
  useInsuranceTypes,
  useCreateInsuranceContract,
} from '~/modules/insurance/hooks';
import {
  InsuranceFormAlerts,
  VendorCustomerSelect,
  PaymentSection,
  FormSubmitButtons,
} from '~/modules/insurance/components';

export const CarInsurancePage = () => {
  const navigate = useNavigate();
  const { insuranceTypes } = useInsuranceTypes();
  const { insuranceProducts } = useInsuranceProducts();
  const { vendors } = useVendors();
  const { customers } = useCustomers();
  const { createInsuranceContract, loading: creating } =
    useCreateInsuranceContract();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    vendorId: '',
    customerId: '',
    productId: '',
    // Contract fields
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    paymentKind: 'cash',
  });

  // Filter products for Vehicle/Car insurance type
  const carInsuranceType = insuranceTypes.find(
    (t) =>
      t.name.toLowerCase().includes('vehicle') ||
      t.name.toLowerCase().includes('car'),
  );

  // Get selected vendor
  const selectedVendor = vendors.find((v) => v.id === formData.vendorId);

  // Filter products based on selected vendor's offered products
  const products = selectedVendor
    ? selectedVendor.offeredProducts
        .filter((vp) => {
          // Filter out products with pricingOverride.percentage === 0
          // If no pricingOverride exists, include the product
          if (!vp.pricingOverride) return true;

          // If pricingOverride exists, check the percentage value
          const percentage = vp.pricingOverride.percentage;

          // If percentage is undefined or null, include the product
          if (percentage === undefined || percentage === null) return true;

          // Exclude products where percentage is 0 (using both strict and loose equality)
          // This handles both number 0 and string "0"
          return (
            percentage !== 0 && percentage !== '0' && Number(percentage) !== 0
          );
        })
        .map((vp) => vp.product)
    : [];

  // Reset productId when vendor changes
  const handleVendorChange = (vendorId: string) => {
    setFormData({
      ...formData,
      vendorId,
      productId: '', // Reset product selection when vendor changes
    });
  };

  // Dynamic insured object based on insurance type attributes
  const [insuredObject, setInsuredObject] = useState<Record<string, any>>({});

  // Get selected product for premium calculation
  const selectedProduct = products.find((p) => p.id === formData.productId);

  // Get vendor's pricing override for the selected product
  const getVendorPricing = () => {
    if (!selectedVendor || !selectedProduct) return null;
    const vendorProduct = selectedVendor.offeredProducts.find(
      (vp) => vp.product.id === selectedProduct.id,
    );
    return vendorProduct?.pricingOverride;
  };

  const vendorPricing = getVendorPricing();

  // Calculate duration in months
  const calculateDurationInMonths = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return months;
  };

  const durationInMonths = calculateDurationInMonths();

  // Get effective percentage: vendor duration > vendor base > product duration > product base
  const getEffectivePercentage = () => {
    if (!selectedProduct) return 3;

    // Check vendor pricing override with duration first
    if (vendorPricing && durationInMonths > 0) {
      const vendorDurationPercentage = vendorPricing.percentageByDuration;
      if (vendorDurationPercentage) {
        const durationKey = `${durationInMonths}months`;
        if (vendorDurationPercentage[durationKey] !== undefined) {
          return vendorDurationPercentage[durationKey];
        }
      }
    }

    // Check vendor base percentage
    if (
      vendorPricing?.percentage !== undefined &&
      vendorPricing?.percentage !== null
    ) {
      return vendorPricing.percentage;
    }

    // Check if product has duration-based pricing
    const percentageByDuration = (selectedProduct.pricingConfig as any)
      ?.percentageByDuration;
    if (percentageByDuration && durationInMonths > 0) {
      const durationKey = `${durationInMonths}months`;
      if (percentageByDuration[durationKey] !== undefined) {
        return percentageByDuration[durationKey];
      }
    }

    // Fall back to product's base percentage
    return (selectedProduct.pricingConfig as any)?.percentage || 3;
  };

  const productPercentage = getEffectivePercentage();

  // Calculate premium based on effective percentage and assessed value
  const calculatePremium = () => {
    if (!selectedProduct || !insuredObject.assessedValue) return 0;
    return insuredObject.assessedValue * (productPercentage / 100);
  };

  const calculatedPremium = calculatePremium();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      await createInsuranceContract({
        variables: {
          vendorId: formData.vendorId,
          customerId: formData.customerId,
          productId: formData.productId,
          insuredObject,
          startDate: formData.startDate,
          endDate: formData.endDate,
          paymentKind: formData.paymentKind,
          chargedAmount: calculatedPremium,
        },
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/insurance/contracts');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create contract');
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
                    <IconCar />
                    Insurance
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost">
                  <IconCar />
                  Car Insurance
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6">
          <div className="max-w-4xl mx-auto w-full">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <IconCar className="text-blue-600" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Vehicle Insurance</h2>
                  <p className="text-muted-foreground">
                    Create a vehicle insurance contract
                  </p>
                </div>
              </div>

              <InsuranceFormAlerts error={error} success={success} />

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vendor & Customer Selection */}
                <VendorCustomerSelect
                  vendors={vendors}
                  customers={customers}
                  vendorId={formData.vendorId}
                  customerId={formData.customerId}
                  onVendorChange={handleVendorChange}
                  onCustomerChange={(value) =>
                    setFormData({ ...formData, customerId: value })
                  }
                />

                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Insurance Product *
                  </label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, productId: value })
                    }
                    disabled={!formData.vendorId}
                  >
                    <Select.Trigger>
                      <Select.Value
                        placeholder={
                          formData.vendorId
                            ? 'Select'
                            : 'Please select a company first'
                        }
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {products.length > 0 ? (
                        products.map((product) => (
                          <Select.Item key={product.id} value={product.id}>
                            {product.name}
                          </Select.Item>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          No products found
                        </div>
                      )}
                    </Select.Content>
                  </Select>
                  {!formData.vendorId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Products will appear after selecting an insurance company
                    </p>
                  )}
                </div>

                <Separator />

                {/* Dynamic Fields from Insurance Type Attributes */}
                {carInsuranceType &&
                  carInsuranceType.attributes &&
                  carInsuranceType.attributes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <IconCar size={20} />
                        Vehicle Information
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Assessed Value Field - Always show first */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Vehicle Value ($) *
                          </label>
                          <Input
                            type="number"
                            value={insuredObject.assessedValue || ''}
                            onChange={(e) =>
                              setInsuredObject({
                                ...insuredObject,
                                assessedValue: parseFloat(e.target.value) || 0,
                              })
                            }
                            min={0}
                            placeholder="Enter vehicle value"
                            required
                          />
                        </div>

                        {carInsuranceType.attributes
                          .filter((attr: any) => attr.name !== 'assessedValue')
                          .map((attr: any) => (
                            <div key={attr.name}>
                              <label className="block text-sm font-medium mb-2">
                                {attr.label || attr.name} {attr.required && '*'}
                              </label>
                              {attr.type === 'select' && attr.options ? (
                                <Select
                                  value={insuredObject[attr.name] || ''}
                                  onValueChange={(value: string) =>
                                    setInsuredObject({
                                      ...insuredObject,
                                      [attr.name]: value,
                                    })
                                  }
                                >
                                  <Select.Trigger>
                                    <Select.Value placeholder="Select" />
                                  </Select.Trigger>
                                  <Select.Content>
                                    {attr.options.map((option: any) => (
                                      <Select.Item key={option} value={option}>
                                        {option}
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select>
                              ) : attr.type === 'number' ? (
                                <Input
                                  type="number"
                                  value={insuredObject[attr.name] || ''}
                                  onChange={(e) =>
                                    setInsuredObject({
                                      ...insuredObject,
                                      [attr.name]:
                                        parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  required={attr.required}
                                />
                              ) : attr.type === 'boolean' ? (
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={insuredObject[attr.name] || false}
                                    onChange={(e) =>
                                      setInsuredObject({
                                        ...insuredObject,
                                        [attr.name]: e.target.checked,
                                      })
                                    }
                                  />
                                </label>
                              ) : (
                                <Input
                                  value={insuredObject[attr.name] || ''}
                                  onChange={(e) =>
                                    setInsuredObject({
                                      ...insuredObject,
                                      [attr.name]: e.target.value,
                                    })
                                  }
                                  required={attr.required}
                                />
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Premium Calculation Display */}
                {insuredObject.assessedValue > 0 && formData.productId && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <IconCurrencyTugrik size={18} />
                      Premium Calculation
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Assessed Value:</span>
                        <span className="font-medium">
                          {insuredObject.assessedValue?.toLocaleString()} ₮
                        </span>
                      </div>
                      {durationInMonths > 0 && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Duration:</span>
                          <span className="font-medium">
                            {durationInMonths} months
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-blue-700">
                          Rate ({selectedProduct?.name}):
                        </span>
                        <span className="font-medium">
                          {productPercentage}%
                          {durationInMonths > 0 && (
                            <span className="text-xs text-blue-600 ml-1">
                              ({durationInMonths} mo)
                            </span>
                          )}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-base">
                        <span className="text-blue-800 font-semibold">
                          Total Premium:
                        </span>
                        <span className="font-bold text-blue-900">
                          {calculatedPremium.toLocaleString()} ₮
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Contract Period */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <IconCalendar size={20} />
                    Insurance Period
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Start Date *
                      </label>
                      <DatePicker
                        value={formData.startDate}
                        onChange={(date) => {
                          if (date) {
                            setFormData({
                              ...formData,
                              startDate: date as Date,
                            });
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Duration *
                      </label>
                      {selectedProduct &&
                      (selectedProduct.pricingConfig as any)
                        ?.percentageByDuration ? (
                        <Select
                          value={
                            durationInMonths > 0
                              ? `${durationInMonths}months`
                              : ''
                          }
                          onValueChange={(value) => {
                            const months = parseInt(
                              value.replace('months', ''),
                            );
                            if (formData.startDate && months > 0) {
                              const endDate = new Date(formData.startDate);
                              endDate.setMonth(endDate.getMonth() + months);
                              setFormData({ ...formData, endDate });
                            }
                          }}
                        >
                          <Select.Trigger>
                            <Select.Value placeholder="Select duration" />
                          </Select.Trigger>
                          <Select.Content>
                            {Object.keys(
                              (selectedProduct.pricingConfig as any)
                                .percentageByDuration,
                            ).map((duration) => {
                              const months = parseInt(
                                duration.replace('months', ''),
                              );
                              const percentage = (
                                selectedProduct.pricingConfig as any
                              ).percentageByDuration[duration];
                              return (
                                <Select.Item key={duration} value={duration}>
                                  {months} months ({percentage}%)
                                </Select.Item>
                              );
                            })}
                          </Select.Content>
                        </Select>
                      ) : (
                        <DatePicker
                          value={formData.endDate}
                          onChange={(date) =>
                            date &&
                            setFormData({ ...formData, endDate: date as Date })
                          }
                        />
                      )}
                      {selectedProduct &&
                        !(selectedProduct.pricingConfig as any)
                          ?.percentageByDuration && (
                          <p className="text-xs text-muted-foreground mt-1">
                            End Date
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment */}
                <PaymentSection
                  paymentKind={formData.paymentKind}
                  onPaymentKindChange={(value) =>
                    setFormData({ ...formData, paymentKind: value })
                  }
                  calculatedPremium={calculatedPremium}
                  showPremiumDisplay={true}
                />

                {/* Submit Button */}
                <FormSubmitButtons creating={creating} success={success} />
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
