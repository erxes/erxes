import { useState, useEffect } from 'react';
import { Dialog, Button, Label, Input, Select } from 'erxes-ui';
import {
  useCreateInsuranceProduct,
  useUpdateInsuranceProduct,
  useInsuranceTypes,
  useRiskTypes,
} from '../hooks';
import { InsuranceProduct } from '../types';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: InsuranceProduct;
  onSuccess?: () => void;
}

export const ProductForm = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductFormProps) => {
  const { createInsuranceProduct, loading: creating } =
    useCreateInsuranceProduct();
  const { updateInsuranceProduct, loading: updating } =
    useUpdateInsuranceProduct();
  const { insuranceTypes, loading: typesLoading } = useInsuranceTypes();
  const { riskTypes, loading: risksLoading } = useRiskTypes();

  const [formData, setFormData] = useState({
    name: '',
    insuranceTypeId: '',
    coveredRisks: [] as { riskId: string; coveragePercentage: number }[],
    pricingConfig: {},
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        insuranceTypeId: product.insuranceType.id,
        coveredRisks: product.coveredRisks.map((cr) => ({
          riskId: cr.risk.id,
          coveragePercentage: cr.coveragePercentage,
        })),
        pricingConfig: product.pricingConfig || {},
      });
    } else {
      setFormData({
        name: '',
        insuranceTypeId: '',
        coveredRisks: [],
        pricingConfig: {},
      });
    }
  }, [product, open]);

  const handleAddRisk = () => {
    setFormData({
      ...formData,
      coveredRisks: [
        ...formData.coveredRisks,
        { riskId: '', coveragePercentage: 100 },
      ],
    });
  };

  const handleRemoveRisk = (index: number) => {
    setFormData({
      ...formData,
      coveredRisks: formData.coveredRisks.filter((_, i) => i !== index),
    });
  };

  const handleRiskChange = (
    index: number,
    field: 'riskId' | 'coveragePercentage',
    value: string | number,
  ) => {
    const newRisks = [...formData.coveredRisks];
    newRisks[index] = { ...newRisks[index], [field]: value };
    setFormData({ ...formData, coveredRisks: newRisks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (product) {
        await updateInsuranceProduct({
          variables: {
            id: product.id,
            name: formData.name,
            coveredRisks: formData.coveredRisks,
            pricingConfig: formData.pricingConfig,
          },
        });
      } else {
        await createInsuranceProduct({
          variables: {
            name: formData.name,
            insuranceTypeId: formData.insuranceTypeId,
            coveredRisks: formData.coveredRisks,
            pricingConfig: formData.pricingConfig,
          },
        });
      }

      setFormData({
        name: '',
        insuranceTypeId: '',
        coveredRisks: [],
        pricingConfig: {},
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <Dialog.Header>
          <Dialog.Title>
            {product ? 'Edit Product' : 'Create New Product'}
          </Dialog.Title>
        </Dialog.Header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Basic Car Insurance"
              required
            />
          </div>

          {!product && (
            <div className="space-y-2">
              <Label htmlFor="insuranceTypeId">Insurance Type *</Label>
              <Select
                value={formData.insuranceTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, insuranceTypeId: value })
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select insurance type" />
                </Select.Trigger>
                <Select.Content>
                  {typesLoading ? (
                    <Select.Item value="loading" disabled>
                      Loading...
                    </Select.Item>
                  ) : (
                    insuranceTypes.map((type) => (
                      <Select.Item key={type.id} value={type.id}>
                        {type.name}
                      </Select.Item>
                    ))
                  )}
                </Select.Content>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Covered Risks *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRisk}
              >
                Add Risk
              </Button>
            </div>

            {formData.coveredRisks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No risks added yet. Click "Add Risk" to start.
              </p>
            ) : (
              <div className="space-y-2">
                {formData.coveredRisks.map((risk, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select
                        value={risk.riskId}
                        onValueChange={(value) =>
                          handleRiskChange(index, 'riskId', value)
                        }
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Select risk" />
                        </Select.Trigger>
                        <Select.Content>
                          {risksLoading ? (
                            <Select.Item value="loading" disabled>
                              Loading...
                            </Select.Item>
                          ) : (
                            riskTypes.map((riskType) => (
                              <Select.Item
                                key={riskType.id}
                                value={riskType.id}
                              >
                                {riskType.name}
                              </Select.Item>
                            ))
                          )}
                        </Select.Content>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={risk.coveragePercentage}
                        onChange={(e) =>
                          handleRiskChange(
                            index,
                            'coveragePercentage',
                            parseInt(e.target.value),
                          )
                        }
                        placeholder="%"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveRisk(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricingConfig">Pricing Config (JSON)</Label>
            <textarea
              id="pricingConfig"
              className="w-full min-h-[100px] p-2 border rounded-md font-mono text-sm"
              value={JSON.stringify(formData.pricingConfig, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData({ ...formData, pricingConfig: parsed });
                } catch (error) {
                  // Invalid JSON, keep as is
                }
              }}
              placeholder='{"basePrice": 1000, "multiplier": 1.5}'
            />
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating || updating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating
                ? 'Saving...'
                : product
                ? 'Update'
                : 'Create'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
