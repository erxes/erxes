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
    additionalCoverages: [] as {
      name: string;
      limits: number[];
      appliesTo: string[];
    }[],
    compensationCalculations: [] as { name: string; methodologies: string[] }[],
    deductibleConfig: { levels: [] as string[] },
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
        additionalCoverages: product.additionalCoverages || [],
        compensationCalculations: product.compensationCalculations || [],
        deductibleConfig: product.deductibleConfig || { levels: [] },
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
        additionalCoverages: [],
        compensationCalculations: [],
        deductibleConfig: { levels: [] },
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
            additionalCoverages:
              formData.additionalCoverages.length > 0
                ? formData.additionalCoverages
                : null,
            compensationCalculations:
              formData.compensationCalculations.length > 0
                ? formData.compensationCalculations
                : null,
            deductibleConfig:
              formData.deductibleConfig.levels.length > 0
                ? formData.deductibleConfig
                : null,
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
            additionalCoverages:
              formData.additionalCoverages.length > 0
                ? formData.additionalCoverages
                : null,
            compensationCalculations:
              formData.compensationCalculations.length > 0
                ? formData.compensationCalculations
                : null,
            deductibleConfig:
              formData.deductibleConfig.levels.length > 0
                ? formData.deductibleConfig
                : null,
          },
        });
      }

      setFormData({
        name: '',
        insuranceTypeId: '',
        pdfContent: '',
        coveredRisks: [],
        pricingConfig: { percentage: 3 },
        additionalCoverages: [],
        compensationCalculations: [],
        deductibleConfig: { levels: [] },
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
              <Label>PDF Contract Template</Label>
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
                    Use Default Template
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
                    Preview
                  </Button>
                )}
              </div>
            </div>
            {formData.pdfContent ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">
                    ✓ PDF template configured
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPdfEditor(!showPdfEditor)}
                    >
                      {showPdfEditor ? 'Collapse' : 'Edit'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData({ ...formData, pdfContent: '' })
                      }
                    >
                      Remove
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
                    placeholder="Enter HTML template..."
                  />
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                PDF template displayed when creating a contract. Click "Use
                Default Template" to start.
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
              <Label htmlFor="percentage">Base Rate (%) *</Label>
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
                Base Premium = Assessed Value × Rate
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Rate by Duration (optional)</Label>
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
                  Add Duration
                </Button>
              </div>

              {durationFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Click "Add Duration" to set different rates by duration
                </p>
              ) : (
                <div className="space-y-2">
                  {durationFields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs">Duration (months)</Label>
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
                        <Label className="text-xs">Rate (%)</Label>
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
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Example: "12months", "24months", "36months", etc.
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Additional Coverage</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Additional Coverage</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      additionalCoverages: [
                        ...formData.additionalCoverages,
                        { name: '', limits: [], appliesTo: [] },
                      ],
                    });
                  }}
                >
                  Add
                </Button>
              </div>

              {formData.additionalCoverages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No additional coverage added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.additionalCoverages.map((coverage, index) => (
                    <div
                      key={index}
                      className="border p-3 rounded-md space-y-2"
                    >
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-xs">Name</Label>
                          <Input
                            value={coverage.name}
                            onChange={(e) => {
                              const newCoverages = [
                                ...formData.additionalCoverages,
                              ];
                              newCoverages[index] = {
                                ...newCoverages[index],
                                name: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                additionalCoverages: newCoverages,
                              });
                            }}
                            placeholder="Insurance damage assessment cost"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              additionalCoverages:
                                formData.additionalCoverages.filter(
                                  (_, i) => i !== index,
                                ),
                            });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Limits</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newCoverages = [
                                ...formData.additionalCoverages,
                              ];
                              newCoverages[index] = {
                                ...newCoverages[index],
                                limits: [...newCoverages[index].limits, 0],
                                appliesTo: [
                                  ...newCoverages[index].appliesTo,
                                  '',
                                ],
                              };
                              setFormData({
                                ...formData,
                                additionalCoverages: newCoverages,
                              });
                            }}
                          >
                            + Add Level
                          </Button>
                        </div>
                        {coverage.limits.map((limit, limitIndex) => (
                          <div key={limitIndex} className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                placeholder="Level (PLATINUM, GOLD...)"
                                value={coverage.appliesTo[limitIndex] || ''}
                                onChange={(e) => {
                                  const newCoverages = [
                                    ...formData.additionalCoverages,
                                  ];
                                  const newAppliesTo = [
                                    ...newCoverages[index].appliesTo,
                                  ];
                                  newAppliesTo[limitIndex] = e.target.value;
                                  newCoverages[index] = {
                                    ...newCoverages[index],
                                    appliesTo: newAppliesTo,
                                  };
                                  setFormData({
                                    ...formData,
                                    additionalCoverages: newCoverages,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <Input
                                type="number"
                                placeholder="Limit (200000)"
                                value={limit || ''}
                                onChange={(e) => {
                                  const newCoverages = [
                                    ...formData.additionalCoverages,
                                  ];
                                  const newLimits = [
                                    ...newCoverages[index].limits,
                                  ];
                                  newLimits[limitIndex] =
                                    parseFloat(e.target.value) || 0;
                                  newCoverages[index] = {
                                    ...newCoverages[index],
                                    limits: newLimits,
                                  };
                                  setFormData({
                                    ...formData,
                                    additionalCoverages: newCoverages,
                                  });
                                }}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newCoverages = [
                                  ...formData.additionalCoverages,
                                ];
                                newCoverages[index] = {
                                  ...newCoverages[index],
                                  limits: newCoverages[index].limits.filter(
                                    (_, i) => i !== limitIndex,
                                  ),
                                  appliesTo: newCoverages[
                                    index
                                  ].appliesTo.filter(
                                    (_, i) => i !== limitIndex,
                                  ),
                                };
                                setFormData({
                                  ...formData,
                                  additionalCoverages: newCoverages,
                                });
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Compensation Calculation Methods</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      compensationCalculations: [
                        ...formData.compensationCalculations,
                        { name: '', methodologies: [] },
                      ],
                    });
                  }}
                >
                  Add
                </Button>
              </div>

              {formData.compensationCalculations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No calculation methods added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.compensationCalculations.map((calc, index) => (
                    <div
                      key={index}
                      className="border p-3 rounded-md space-y-2"
                    >
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-xs">Name</Label>
                          <Input
                            value={calc.name}
                            onChange={(e) => {
                              const newCalcs = [
                                ...formData.compensationCalculations,
                              ];
                              newCalcs[index] = {
                                ...newCalcs[index],
                                name: e.target.value,
                              };
                              setFormData({
                                ...formData,
                                compensationCalculations: newCalcs,
                              });
                            }}
                            placeholder="Replacement part valuation method"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              compensationCalculations:
                                formData.compensationCalculations.filter(
                                  (_, i) => i !== index,
                                ),
                            });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Methods</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newCalcs = [
                                ...formData.compensationCalculations,
                              ];
                              newCalcs[index] = {
                                ...newCalcs[index],
                                methodologies: [
                                  ...newCalcs[index].methodologies,
                                  '',
                                ],
                              };
                              setFormData({
                                ...formData,
                                compensationCalculations: newCalcs,
                              });
                            }}
                          >
                            + Add Method
                          </Button>
                        </div>
                        {calc.methodologies.map((methodology, methodIndex) => (
                          <div key={methodIndex} className="flex gap-2">
                            <Input
                              placeholder="Method (No depreciation)"
                              value={methodology}
                              onChange={(e) => {
                                const newCalcs = [
                                  ...formData.compensationCalculations,
                                ];
                                const newMethodologies = [
                                  ...newCalcs[index].methodologies,
                                ];
                                newMethodologies[methodIndex] = e.target.value;
                                newCalcs[index] = {
                                  ...newCalcs[index],
                                  methodologies: newMethodologies,
                                };
                                setFormData({
                                  ...formData,
                                  compensationCalculations: newCalcs,
                                });
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newCalcs = [
                                  ...formData.compensationCalculations,
                                ];
                                newCalcs[index] = {
                                  ...newCalcs[index],
                                  methodologies: newCalcs[
                                    index
                                  ].methodologies.filter(
                                    (_, i) => i !== methodIndex,
                                  ),
                                };
                                setFormData({
                                  ...formData,
                                  compensationCalculations: newCalcs,
                                });
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Deductible Levels</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      deductibleConfig: {
                        levels: [...formData.deductibleConfig.levels, ''],
                      },
                    });
                  }}
                >
                  + Add Level
                </Button>
              </div>
              {formData.deductibleConfig.levels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No deductible levels added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {formData.deductibleConfig.levels.map((level, levelIndex) => (
                    <div key={levelIndex} className="flex gap-2">
                      <Input
                        placeholder="Deductible (None, 20% of damage)"
                        value={level}
                        onChange={(e) => {
                          const newLevels = [
                            ...formData.deductibleConfig.levels,
                          ];
                          newLevels[levelIndex] = e.target.value;
                          setFormData({
                            ...formData,
                            deductibleConfig: { levels: newLevels },
                          });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            deductibleConfig: {
                              levels: formData.deductibleConfig.levels.filter(
                                (_, i) => i !== levelIndex,
                              ),
                            },
                          });
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
