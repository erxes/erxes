import { useState } from 'react';
import {
  IconUser,
  IconPlus,
  IconCalendar,
  IconCurrencyTugrik,
  IconShieldCheck,
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
  useProductsByType,
  useInsuranceTypes,
  useCreateInsuranceContract,
} from '~/modules/insurance/hooks';

export const CitizenInsurancePage = () => {
  const navigate = useNavigate();
  const { insuranceTypes } = useInsuranceTypes();
  const citizenInsuranceType = insuranceTypes.find(
    (t) => t.name === 'Citizen Insurance',
  );
  const { products } = useProductsByType(citizenInsuranceType?.id || '');
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
    // Citizen specific fields
    age: 0,
    gender: '',
    occupation: '',
    healthCondition: 'good',
    smoker: false,
    chronicDiseases: '',
    emergencyContact: '',
    emergencyPhone: '',
    coverageAmount: 0,
    beneficiaryName: '',
    beneficiaryRelation: '',
    // Contract fields
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    paymentKind: 'cash',
  });

  const genderOptions = [
    { value: 'male', label: 'Эрэгтэй' },
    { value: 'female', label: 'Эмэгтэй' },
  ];

  const healthConditionOptions = [
    { value: 'excellent', label: 'Маш сайн' },
    { value: 'good', label: 'Сайн' },
    { value: 'fair', label: 'Дунд' },
    { value: 'poor', label: 'Муу' },
  ];

  const occupationOptions = [
    { value: 'office', label: 'Оффис ажилтан' },
    { value: 'teacher', label: 'Багш' },
    { value: 'doctor', label: 'Эмч' },
    { value: 'driver', label: 'Жолооч' },
    { value: 'construction', label: 'Барилгын ажилчин' },
    { value: 'business', label: 'Бизнес эрхлэгч' },
    { value: 'student', label: 'Оюутан' },
    { value: 'retired', label: 'Тэтгэвэрт' },
    { value: 'other', label: 'Бусад' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const insuredObject = {
      age: formData.age,
      gender: formData.gender,
      occupation: formData.occupation,
      healthCondition: formData.healthCondition,
      smoker: formData.smoker,
      chronicDiseases: formData.chronicDiseases,
      emergencyContact: formData.emergencyContact,
      emergencyPhone: formData.emergencyPhone,
      coverageAmount: formData.coverageAmount,
      beneficiaryName: formData.beneficiaryName,
      beneficiaryRelation: formData.beneficiaryRelation,
    };

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
        },
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/insurance/contracts');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Гэрээ үүсгэхэд алдаа гарлаа');
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
                    <IconUser />
                    Insurance
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost">
                  <IconUser />
                  Citizen Insurance
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
                <div className="p-3 bg-green-100 rounded-lg">
                  <IconShieldCheck className="text-green-600" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Иргэний даатгал</h2>
                  <p className="text-muted-foreground">
                    Иргэний даатгалын гэрээ үүсгэх
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                  Гэрээ амжилттай үүсгэгдлээ! Гэрээний жагсаалт руу шилжиж
                  байна...
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vendor & Customer Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Даатгалын компани *
                    </label>
                    <Select
                      value={formData.vendorId}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, vendorId: value })
                      }
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Сонгох" />
                      </Select.Trigger>
                      <Select.Content>
                        {vendors.map((vendor) => (
                          <Select.Item key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Даатгуулагч *
                    </label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, customerId: value })
                      }
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Сонгох" />
                      </Select.Trigger>
                      <Select.Content>
                        {customers.map((customer) => (
                          <Select.Item key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                </div>

                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Даатгалын бүтээгдэхүүн *
                  </label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, productId: value })
                    }
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Сонгох" />
                    </Select.Trigger>
                    <Select.Content>
                      {products.map((product) => (
                        <Select.Item key={product.id} value={product.id}>
                          {product.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <Separator />

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <IconUser size={20} />
                    Хувийн мэдээлэл
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Нас *
                      </label>
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            age: parseInt(e.target.value),
                          })
                        }
                        min={0}
                        max={120}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Хүйс *
                      </label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, gender: value })
                        }
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Сонгох" />
                        </Select.Trigger>
                        <Select.Content>
                          {genderOptions.map((option) => (
                            <Select.Item
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Мэргэжил *
                      </label>
                      <Select
                        value={formData.occupation}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, occupation: value })
                        }
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Сонгох" />
                        </Select.Trigger>
                        <Select.Content>
                          {occupationOptions.map((option) => (
                            <Select.Item
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Эрүүл мэндийн байдал *
                      </label>
                      <Select
                        value={formData.healthCondition}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, healthCondition: value })
                        }
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Сонгох" />
                        </Select.Trigger>
                        <Select.Content>
                          {healthConditionOptions.map((option) => (
                            <Select.Item
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Архаг өвчин
                      </label>
                      <Input
                        value={formData.chronicDiseases}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chronicDiseases: e.target.value,
                          })
                        }
                        placeholder="Цусны даралт, чихрийн шижин гэх мэт..."
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.smoker}
                        onChange={(e) =>
                          setFormData({ ...formData, smoker: e.target.checked })
                        }
                      />
                      <span className="text-sm">Тамхи татдаг</span>
                    </label>
                  </div>
                </div>

                <Separator />

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Яаралтай холбоо барих
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Нэр *
                      </label>
                      <Input
                        value={formData.emergencyContact}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: e.target.value,
                          })
                        }
                        placeholder="Овог нэр"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Утас *
                      </label>
                      <Input
                        value={formData.emergencyPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyPhone: e.target.value,
                          })
                        }
                        placeholder="99001122"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Beneficiary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Хүлээн авагч</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Хүлээн авагчийн нэр *
                      </label>
                      <Input
                        value={formData.beneficiaryName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            beneficiaryName: e.target.value,
                          })
                        }
                        placeholder="Овог нэр"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Хамаарал *
                      </label>
                      <Input
                        value={formData.beneficiaryRelation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            beneficiaryRelation: e.target.value,
                          })
                        }
                        placeholder="Эхнэр, Нөхөр, Хүүхэд гэх мэт"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Хамгаалалтын дүн (₮) *
                      </label>
                      <Input
                        type="number"
                        value={formData.coverageAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            coverageAmount: parseFloat(e.target.value),
                          })
                        }
                        min={0}
                        placeholder="10000000"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contract Period */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <IconCalendar size={20} />
                    Даатгалын хугацаа
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Эхлэх огноо *
                      </label>
                      <DatePicker
                        value={formData.startDate}
                        onChange={(date) =>
                          date &&
                          setFormData({ ...formData, startDate: date as Date })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Дуусах огноо *
                      </label>
                      <DatePicker
                        value={formData.endDate}
                        onChange={(date) =>
                          date &&
                          setFormData({ ...formData, endDate: date as Date })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <IconCurrencyTugrik size={20} />
                    Төлбөрийн мэдээлэл
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Төлбөрийн хэлбэр *
                    </label>
                    <Select
                      value={formData.paymentKind}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, paymentKind: value })
                      }
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Сонгох" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="cash">Бэлэн мөнгө</Select.Item>
                        <Select.Item value="qpay">QPay</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={creating}
                  >
                    <Link to="/insurance">Болих</Link>
                  </Button>
                  <Button type="submit" disabled={creating || success}>
                    <IconPlus size={16} />
                    {creating ? 'Үүсгэж байна...' : 'Гэрээ үүсгэх'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
