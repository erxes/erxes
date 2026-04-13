import { useState, useEffect, useCallback } from 'react';
import {
  IconPlane,
  IconCalendar,
  IconUsers,
  IconCreditCard,
  IconPlus,
  IconTrash,
  IconCheck,
  IconChevronRight,
  IconChevronLeft,
  IconMapPin,
} from '@tabler/icons-react';
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
  useInsuranceTypes,
  useCreateInsuranceContract,
  useProductsByCountry,
  useCalculateTravelPrice,
  useRegions,
} from '~/modules/insurance/hooks';
import {
  InsuranceFormAlerts,
  VendorCustomerSelect,
  PaymentSection,
} from '~/modules/insurance/components';
import type {
  Traveler,
  InsuranceProduct,
  InsuranceRegion,
  TravelPriceResult,
} from '~/modules/insurance/types';

const EMPTY_TRAVELER: Traveler = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  registerNumber: '',
  passportNumber: '',
};

const STEPS = [
  { id: 1, label: 'Аялалын мэдээлэл', icon: IconMapPin },
  { id: 2, label: 'Бүтээгдэхүүн сонгох', icon: IconPlane },
  { id: 3, label: 'Аялагчдын мэдээлэл', icon: IconUsers },
  { id: 4, label: 'Төлбөр', icon: IconCreditCard },
];

export const CitizenInsurancePage = () => {
  const navigate = useNavigate();
  const { insuranceTypes } = useInsuranceTypes();
  const { vendors } = useVendors();
  const { customers } = useCustomers();
  const { regions } = useRegions();
  const { createInsuranceContract, loading: creating } =
    useCreateInsuranceContract();
  const {
    fetchProducts,
    products: countryProducts,
    loading: productsLoading,
  } = useProductsByCountry();
  const {
    calculate: calculatePrice,
    priceResult,
    loading: priceLoading,
  } = useCalculateTravelPrice();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Step 1: Travel info
  const [destinationCountry, setDestinationCountry] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() + 7)),
  );

  // Step 2: Product
  const [selectedProductId, setSelectedProductId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [customerId, setCustomerId] = useState('');

  // Step 3: Travelers
  const [travelers, setTravelers] = useState<Traveler[]>([
    { ...EMPTY_TRAVELER },
  ]);

  // Step 4: Payment
  const [paymentKind, setPaymentKind] = useState('cash');

  // Build a flat list of all countries from all regions
  const allCountries = regions
    .reduce((acc: string[], region: InsuranceRegion) => {
      return [
        ...acc,
        ...region.countries.filter((c: string) => !acc.includes(c)),
      ];
    }, [])
    .sort();

  // Fetch products when destination country changes
  useEffect(() => {
    if (destinationCountry) {
      fetchProducts(destinationCountry);
    }
  }, [destinationCountry]);

  // Calculate price when relevant fields change
  const recalculatePrice = useCallback(() => {
    if (
      selectedProductId &&
      vendorId &&
      startDate &&
      endDate &&
      travelers.length > 0
    ) {
      calculatePrice({
        productId: selectedProductId,
        vendorId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        travelerCount: travelers.length,
      });
    }
  }, [selectedProductId, vendorId, startDate, endDate, travelers.length]);

  useEffect(() => {
    recalculatePrice();
  }, [recalculatePrice]);

  const selectedProduct = countryProducts.find(
    (p: InsuranceProduct) => p.id === selectedProductId,
  );

  const citizenType = insuranceTypes.find((t: any) => t.isCitizen === true);

  // Traveler management
  const addTraveler = () => {
    setTravelers([...travelers, { ...EMPTY_TRAVELER }]);
  };

  const removeTraveler = (index: number) => {
    if (travelers.length <= 1) return;
    setTravelers(travelers.filter((_, i) => i !== index));
  };

  const updateTraveler = (
    index: number,
    field: keyof Traveler,
    value: string,
  ) => {
    const updated = [...travelers];
    updated[index] = { ...updated[index], [field]: value };
    setTravelers(updated);
  };

  // Validation
  const isStep1Valid =
    destinationCountry && startDate && endDate && endDate > startDate;
  const isStep2Valid = selectedProductId && vendorId && customerId;
  const isStep3Valid = travelers.every(
    (t) =>
      t.firstName &&
      t.lastName &&
      t.email &&
      t.phone &&
      t.registerNumber &&
      t.passportNumber,
  );

  const handleSubmit = async () => {
    if (!citizenType || !selectedProduct || !priceResult) return;

    try {
      setError(null);

      // Create a contract for each traveler
      for (const traveler of travelers) {
        const insuredObject = {
          ...traveler,
          destinationCountry,
          travelStartDate: startDate.toISOString(),
          travelEndDate: endDate.toISOString(),
          regionName: selectedProduct.regions?.[0]?.name || '',
          numberOfTravelersInGroup: travelers.length,
          dailyRate: selectedProduct.pricingConfig?.dailyRate,
          discountPercent: priceResult.discountPercent,
        };

        await createInsuranceContract({
          variables: {
            vendorId,
            customerId,
            productId: selectedProductId,
            insuredObject,
            startDate,
            endDate,
            paymentKind,
          },
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/insurance/contracts');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Гэрээ үүсгэхэд алдаа гарлаа');
    }
  };

  const days = Math.max(
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
    1,
  );

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/insurance/products">
                    <IconPlane />
                    Даатгал
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost">
                  <IconPlane />
                  Аялалын даатгал
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
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-8">
              {STEPS.map((s, index) => (
                <div key={s.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                      step === s.id
                        ? 'bg-primary text-white'
                        : step > s.id
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => {
                      if (s.id < step) setStep(s.id);
                    }}
                  >
                    {step > s.id ? (
                      <IconCheck size={18} />
                    ) : (
                      <s.icon size={18} />
                    )}
                    <span className="text-sm font-medium hidden md:inline">
                      {s.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <IconChevronRight
                      size={16}
                      className="mx-2 text-gray-300"
                    />
                  )}
                </div>
              ))}
            </div>

            <Card className="p-6">
              <InsuranceFormAlerts
                error={error}
                success={success}
                successMessage="Аялалын даатгалын гэрээнүүд амжилттай үүслээ!"
              />

              {/* Step 1: Travel Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <IconMapPin className="text-blue-600" size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Аялалын мэдээлэл</h2>
                      <p className="text-muted-foreground">
                        Очих улс болон аялалын хугацааг оруулна уу
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Очих улс *
                    </label>
                    <Select
                      value={destinationCountry}
                      onValueChange={setDestinationCountry}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Улс сонгох" />
                      </Select.Trigger>
                      <Select.Content>
                        {allCountries.map((country: string) => (
                          <Select.Item key={country} value={country}>
                            {country}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <IconCalendar size={16} className="inline mr-1" />
                        Аялал эхлэх өдөр *
                      </label>
                      <DatePicker
                        value={startDate}
                        onChange={(date) => date && setStartDate(date as Date)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <IconCalendar size={16} className="inline mr-1" />
                        Аялал дуусах өдөр *
                      </label>
                      <DatePicker
                        value={endDate}
                        onChange={(date) => date && setEndDate(date as Date)}
                      />
                    </div>
                  </div>

                  {startDate && endDate && endDate > startDate && (
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                      Аялалын хугацаа: <strong>{days} хоног</strong>
                    </div>
                  )}

                  {endDate <= startDate && (
                    <div className="p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                      Дуусах огноо нь эхлэх огнооноос хойш байх ёстой
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button disabled={!isStep1Valid} onClick={() => setStep(2)}>
                      Дараагийн алхам
                      <IconChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Product Selection */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <IconPlane className="text-purple-600" size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        Бүтээгдэхүүн сонгох
                      </h2>
                      <p className="text-muted-foreground">
                        {destinationCountry} руу зорчиход тохирох даатгалын
                        бүтээгдэхүүн сонгоно уу
                      </p>
                    </div>
                  </div>

                  <VendorCustomerSelect
                    vendors={vendors}
                    customers={customers}
                    vendorId={vendorId}
                    customerId={customerId}
                    onVendorChange={setVendorId}
                    onCustomerChange={setCustomerId}
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Даатгалын бүтээгдэхүүн *
                    </label>
                    {productsLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Бүтээгдэхүүн хайж байна...
                      </div>
                    ) : countryProducts.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                        {destinationCountry} улсад тохирох бүтээгдэхүүн
                        олдсонгүй
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {countryProducts.map((product: InsuranceProduct) => (
                          <div
                            key={product.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedProductId === product.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedProductId(product.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {product.regions
                                    ?.map((r: InsuranceRegion) => r.name)
                                    .join(', ')}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary">
                                  {product.pricingConfig?.dailyRate?.toLocaleString()}
                                  ₮
                                </div>
                                <div className="text-xs text-gray-500">
                                  /хоног/хүн
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <IconChevronLeft size={16} />
                      Өмнөх
                    </Button>
                    <Button disabled={!isStep2Valid} onClick={() => setStep(3)}>
                      Дараагийн алхам
                      <IconChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Traveler Information */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <IconUsers className="text-green-600" size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Аялагчдын мэдээлэл</h2>
                      <p className="text-muted-foreground">
                        Аялагч бүрийн мэдээллийг оруулна уу ({travelers.length}{' '}
                        аялагч)
                      </p>
                    </div>
                  </div>

                  {travelers.map((traveler, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Аялагч #{index + 1}</h4>
                        {travelers.length > 1 && (
                          <button
                            onClick={() => removeTraveler(index)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <IconTrash size={16} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Овог *
                          </label>
                          <Input
                            value={traveler.lastName}
                            onChange={(e) =>
                              updateTraveler(index, 'lastName', e.target.value)
                            }
                            placeholder="Овог"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Нэр *
                          </label>
                          <Input
                            value={traveler.firstName}
                            onChange={(e) =>
                              updateTraveler(index, 'firstName', e.target.value)
                            }
                            placeholder="Нэр"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Мэйл хаяг *
                          </label>
                          <Input
                            type="email"
                            value={traveler.email}
                            onChange={(e) =>
                              updateTraveler(index, 'email', e.target.value)
                            }
                            placeholder="email@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Утасны дугаар *
                          </label>
                          <Input
                            value={traveler.phone}
                            onChange={(e) =>
                              updateTraveler(index, 'phone', e.target.value)
                            }
                            placeholder="99001122"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Регистрийн дугаар (Латин) *
                          </label>
                          <Input
                            value={traveler.registerNumber}
                            onChange={(e) =>
                              updateTraveler(
                                index,
                                'registerNumber',
                                e.target.value.toUpperCase(),
                              )
                            }
                            placeholder="УА12345678"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Гадаад паспортны дугаар *
                          </label>
                          <Input
                            value={traveler.passportNumber}
                            onChange={(e) =>
                              updateTraveler(
                                index,
                                'passportNumber',
                                e.target.value.toUpperCase(),
                              )
                            }
                            placeholder="E12345678"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addTraveler}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg w-full justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors"
                  >
                    <IconPlus size={18} />
                    Аялагч нэмэх
                  </button>

                  {/* Price summary */}
                  {priceResult && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Үнийн тооцоо</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Өдрийн тариф:</div>
                        <div className="text-right">
                          {priceResult.dailyRate.toLocaleString()}₮
                        </div>
                        <div>Хоногийн тоо:</div>
                        <div className="text-right">{priceResult.days}</div>
                        <div>Аялагчдын тоо:</div>
                        <div className="text-right">
                          {priceResult.travelerCount}
                        </div>
                        {priceResult.discountPercent > 0 && (
                          <>
                            <div className="text-green-600">Хөнгөлөлт:</div>
                            <div className="text-right text-green-600">
                              -{priceResult.discountPercent}%
                            </div>
                          </>
                        )}
                        <Separator className="col-span-2" />
                        <div className="font-bold">Нэг хүний дүн:</div>
                        <div className="text-right font-bold">
                          {priceResult.perPerson.toLocaleString()}₮
                        </div>
                        <div className="font-bold text-lg">Нийт дүн:</div>
                        <div className="text-right font-bold text-lg text-primary">
                          {priceResult.total.toLocaleString()}₮
                        </div>
                      </div>
                    </div>
                  )}

                  {priceLoading && (
                    <div className="p-4 text-center text-gray-500">
                      Үнэ тооцоолж байна...
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <IconChevronLeft size={16} />
                      Өмнөх
                    </Button>
                    <Button disabled={!isStep3Valid} onClick={() => setStep(4)}>
                      Дараагийн алхам
                      <IconChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <IconCreditCard className="text-amber-600" size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Төлбөр</h2>
                      <p className="text-muted-foreground">
                        Төлбөрийн мэдээлэл баталгаажуулах
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <h4 className="font-semibold">Нэгтгэл</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Очих улс:</div>
                      <div>{destinationCountry}</div>
                      <div className="text-gray-500">Бүтээгдэхүүн:</div>
                      <div>{selectedProduct?.name}</div>
                      <div className="text-gray-500">Хугацаа:</div>
                      <div>
                        {startDate.toLocaleDateString()} -{' '}
                        {endDate.toLocaleDateString()} ({days} хоног)
                      </div>
                      <div className="text-gray-500">Аялагчдын тоо:</div>
                      <div>{travelers.length}</div>
                    </div>
                  </div>

                  {/* Traveler list summary */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Аялагчид</h4>
                    {travelers.map((t, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <span>
                          {i + 1}. {t.lastName} {t.firstName}
                        </span>
                        <span className="text-gray-500">
                          {t.passportNumber}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  {priceResult && (
                    <div className="p-4 bg-primary/5 border-2 border-primary rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">
                            Нийт төлбөр ({travelers.length} аялагч)
                          </div>
                          {priceResult.discountPercent > 0 && (
                            <div className="text-sm text-green-600">
                              {priceResult.discountPercent}% хөнгөлөлт
                              тооцогдсон
                            </div>
                          )}
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          {priceResult.total.toLocaleString()}₮
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Нэг хүний дүн: {priceResult.perPerson.toLocaleString()}₮
                      </div>
                    </div>
                  )}

                  <PaymentSection
                    paymentKind={paymentKind}
                    onPaymentKindChange={setPaymentKind}
                  />

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(3)}>
                      <IconChevronLeft size={16} />
                      Өмнөх
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={creating || success}
                    >
                      {creating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Гэрээ үүсгэж байна...
                        </>
                      ) : success ? (
                        <>
                          <IconCheck size={16} />
                          Амжилттай!
                        </>
                      ) : (
                        <>
                          <IconCheck size={16} />
                          Гэрээ үүсгэх ({travelers.length} гэрээ)
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
