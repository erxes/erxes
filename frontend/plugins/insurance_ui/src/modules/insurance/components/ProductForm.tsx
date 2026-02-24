import { useState, useEffect } from 'react';
import { Dialog, Button, Label, Input, Select } from 'erxes-ui';
import { IconEye } from '@tabler/icons-react';
import {
  useCreateInsuranceProduct,
  useUpdateInsuranceProduct,
  useInsuranceTypes,
  useRiskTypes,
} from '../hooks';
import { InsuranceProduct } from '../types';
import { getDefaultPdfTemplate } from '~/utils/contractPdfGenerator';

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
    pdfContent: '',
    coveredRisks: [] as { riskId: string; coveragePercentage: number }[],
    pricingConfig: { percentage: 3 } as Record<
      string,
      number | Record<string, number>
    >,
  });
  const [showPdfEditor, setShowPdfEditor] = useState(false);

  const [durationFields, setDurationFields] = useState<
    { duration: string; percentage: number }[]
  >([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        insuranceTypeId: product.insuranceType.id,
        pdfContent: product.pdfContent || '',
        coveredRisks: product.coveredRisks.map((cr) => ({
          riskId: cr.risk.id,
          coveragePercentage: cr.coveragePercentage,
        })),
        pricingConfig: product.pricingConfig || { percentage: 3 },
      });

      const percentageByDuration = (product.pricingConfig as any)
        ?.percentageByDuration;
      if (percentageByDuration && typeof percentageByDuration === 'object') {
        const durationEntries = Object.entries(percentageByDuration).map(
          ([duration, percentage]) => ({
            duration,
            percentage: percentage as number,
          }),
        );
        setDurationFields(durationEntries);
      } else {
        setDurationFields([]);
      }
    } else {
      setFormData({
        name: '',
        insuranceTypeId: '',
        pdfContent: '',
        coveredRisks: [],
        pricingConfig: { percentage: 3 },
      });
      setDurationFields([]);
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
            pdfContent: formData.pdfContent || null,
          },
        });
      } else {
        await createInsuranceProduct({
          variables: {
            name: formData.name,
            insuranceTypeId: formData.insuranceTypeId,
            coveredRisks: formData.coveredRisks,
            pricingConfig: formData.pricingConfig,
            pdfContent: formData.pdfContent || null,
          },
        });
      }

      setFormData({
        name: '',
        insuranceTypeId: '',
        pdfContent: '',
        coveredRisks: [],
        pricingConfig: { percentage: 3 },
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-2xl">
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
              <Label>PDF Гэрээний загвар</Label>
              <div className="flex gap-2">
                {!formData.pdfContent && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        pdfContent: getDefaultPdfTemplate(),
                      });
                      setShowPdfEditor(true);
                    }}
                  >
                    Үндсэн загвар ашиглах
                  </Button>
                )}
                {formData.pdfContent && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const previewWindow = window.open('', '_blank');
                      if (previewWindow) {
                        previewWindow.document.write(formData.pdfContent);
                        previewWindow.document.close();
                      }
                    }}
                  >
                    <IconEye size={16} />
                    Урьдчилан харах
                  </Button>
                )}
              </div>
            </div>
            {formData.pdfContent ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">
                    ✓ PDF загвар тохируулсан
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPdfEditor(!showPdfEditor)}
                    >
                      {showPdfEditor ? 'Хураах' : 'Засах'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData({ ...formData, pdfContent: '' })
                      }
                    >
                      Устгах
                    </Button>
                  </div>
                </div>
                {showPdfEditor && (
                  <textarea
                    value={formData.pdfContent}
                    onChange={(e) =>
                      setFormData({ ...formData, pdfContent: e.target.value })
                    }
                    className="w-full h-[300px] p-2 font-mono text-xs border rounded-md"
                    placeholder="HTML загвар оруулна уу..."
                  />
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Гэрээ хийх үед харагдах PDF загвар. "Үндсэн загвар ашиглах" дарж
                эхлүүлнэ үү.
              </p>
            )}
          </div>

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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="percentage">Үндсэн хувь (%) *</Label>
              <Input
                id="percentage"
                type="number"
                min="0"
                step="0.1"
                value={(formData.pricingConfig.percentage as number) || 3}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricingConfig: {
                      ...formData.pricingConfig,
                      percentage: parseFloat(e.target.value) || 3,
                    },
                  })
                }
                placeholder="3"
                required
              />
              <p className="text-xs text-muted-foreground">
                Үндсэн хураамж = Үнэлгээний үнэ × Хувь
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Хугацаагаар хувь (сонголттой)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDurationFields([
                      ...durationFields,
                      { duration: '', percentage: 0 },
                    ]);
                  }}
                >
                  Хугацаа нэмэх
                </Button>
              </div>

              {durationFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Хугацаагаар өөр хувь тохируулах бол "Хугацаа нэмэх" дарна уу
                </p>
              ) : (
                <div className="space-y-2">
                  {durationFields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs">Хугацаа (сар)</Label>
                        <Input
                          value={field.duration}
                          onChange={(e) => {
                            const newFields = [...durationFields];
                            newFields[index] = {
                              ...newFields[index],
                              duration: e.target.value,
                            };
                            setDurationFields(newFields);

                            const percentageByDuration: Record<string, number> =
                              {};
                            newFields.forEach((f) => {
                              if (f.duration) {
                                percentageByDuration[f.duration] = f.percentage;
                              }
                            });
                            setFormData({
                              ...formData,
                              pricingConfig: {
                                ...formData.pricingConfig,
                                percentageByDuration,
                              },
                            });
                          }}
                          placeholder="12months"
                        />
                      </div>
                      <div className="w-32">
                        <Label className="text-xs">Хувь (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={field.percentage}
                          onChange={(e) => {
                            const newFields = [...durationFields];
                            newFields[index] = {
                              ...newFields[index],
                              percentage: parseFloat(e.target.value) || 0,
                            };
                            setDurationFields(newFields);

                            const percentageByDuration: Record<string, number> =
                              {};
                            newFields.forEach((f) => {
                              if (f.duration) {
                                percentageByDuration[f.duration] = f.percentage;
                              }
                            });
                            setFormData({
                              ...formData,
                              pricingConfig: {
                                ...formData.pricingConfig,
                                percentageByDuration,
                              },
                            });
                          }}
                          placeholder="3"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newFields = durationFields.filter(
                            (_, i) => i !== index,
                          );
                          setDurationFields(newFields);

                          const percentageByDuration: Record<string, number> =
                            {};
                          newFields.forEach((f) => {
                            if (f.duration) {
                              percentageByDuration[f.duration] = f.percentage;
                            }
                          });
                          setFormData({
                            ...formData,
                            pricingConfig: {
                              ...formData.pricingConfig,
                              percentageByDuration,
                            },
                          });
                        }}
                      >
                        Устгах
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Жишээ: "12months", "24months", "36months" гэх мэт
              </p>
            </div>
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
