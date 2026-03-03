import { useState } from 'react';
import { IconUser, IconCalendar, IconShieldCheck } from '@tabler/icons-react';
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
import {
  InsuranceFormAlerts,
  VendorCustomerSelect,
  PaymentSection,
  FormSubmitButtons,
} from '~/modules/insurance/components';

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
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  const healthConditionOptions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  const occupationOptions = [
    { value: 'office', label: 'Office Worker' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'driver', label: 'Driver' },
    { value: 'construction', label: 'Construction Worker' },
    { value: 'business', label: 'Business Owner' },
    { value: 'student', label: 'Student' },
    { value: 'retired', label: 'Retired' },
    { value: 'other', label: 'Other' },
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
                  <h2 className="text-2xl font-bold">Citizen Insurance</h2>
                  <p className="text-muted-foreground">
                    Create a citizen insurance contract
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
                  onVendorChange={(value) =>
                    setFormData({ ...formData, vendorId: value })
                  }
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
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select" />
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
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Age *
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
                        Gender *
                      </label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, gender: value })
                        }
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Select" />
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
                        Occupation *
                      </label>
                      <Select
                        value={formData.occupation}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, occupation: value })
                        }
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Select" />
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
                        Health Condition *
                      </label>
                      <Select
                        value={formData.healthCondition}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, healthCondition: value })
                        }
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Select" />
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
                        Chronic Diseases
                      </label>
                      <Input
                        value={formData.chronicDiseases}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chronicDiseases: e.target.value,
                          })
                        }
                        placeholder="High blood pressure, diabetes, etc..."
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
                      <span className="text-sm">Smoker</span>
                    </label>
                  </div>
                </div>

                <Separator />

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Emergency Contact
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Name *
                      </label>
                      <Input
                        value={formData.emergencyContact}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: e.target.value,
                          })
                        }
                        placeholder="Full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phone *
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
                  <h3 className="text-lg font-semibold mb-4">Beneficiary</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Beneficiary Name *
                      </label>
                      <Input
                        value={formData.beneficiaryName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            beneficiaryName: e.target.value,
                          })
                        }
                        placeholder="Full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Relationship *
                      </label>
                      <Input
                        value={formData.beneficiaryRelation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            beneficiaryRelation: e.target.value,
                          })
                        }
                        placeholder="Wife, Husband, Child, etc."
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Coverage Amount ($) *
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
                    Insurance Period
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Start Date *
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
                        End Date *
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
                <PaymentSection
                  paymentKind={formData.paymentKind}
                  onPaymentKindChange={(value) =>
                    setFormData({ ...formData, paymentKind: value })
                  }
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
