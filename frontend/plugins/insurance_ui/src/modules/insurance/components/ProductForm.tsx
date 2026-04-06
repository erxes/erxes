import { useState, useEffect } from 'react';
import { Dialog, Button, Label, Input, Select } from 'erxes-ui';
import { IconEye, IconPlus, IconX } from '@tabler/icons-react';
import {
  useCreateInsuranceProduct,
  useUpdateInsuranceProduct,
  useInsuranceTypes,
  useRiskTypes,
  useRegions,
} from '../hooks';
import { InsuranceProduct } from '../types';
import { getDefaultPdfTemplate } from '~/utils/contractPdfGenerator';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: InsuranceProduct;
  onSuccess?: () => void;
}

// Reusable region fields component for travel insurance modes
const RegionFields = ({
  pricingConfig,
  onFieldChange,
  newCountry,
  setNewCountry,
  regions,
}: {
  pricingConfig: Record<
    string,
    number | string | string[] | Record<string, number>
  >;
  onFieldChange: (field: string, value: unknown) => void;
  newCountry: string;
  setNewCountry: (v: string) => void;
  regions: { id: string; name: string; countries: string[] }[];
}) => {
  const countries = (pricingConfig.countries as string[]) || [];
  const selectedRegionId = (pricingConfig.region as string) || '';

  const handleRegionSelect = (regionId: string) => {
    const region = regions.find((r) => r.id === regionId);
    if (!region) return;
    onFieldChange('region', region.id);
    onFieldChange('regionName', region.name);
    onFieldChange('countries', region.countries);
  };

  const addCountry = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || countries.includes(trimmed)) return;
    onFieldChange('countries', [...countries, trimmed]);
    setNewCountry('');
  };

  return (
    <div className="space-y-3 border rounded-md p-3 bg-blue-50/50">
      <Label className="font-semibold">Бүс нутгийн тохиргоо (Travel)</Label>

      {/* Region selector from DB */}
      <div className="space-y-1">
        <Label className="text-xs">Бүс нутаг сонгох *</Label>
        <Select value={selectedRegionId} onValueChange={handleRegionSelect}>
          <Select.Trigger>
            <Select.Value placeholder="Бүс нутаг сонгоно уу" />
          </Select.Trigger>
          <Select.Content>
            {regions.map((r) => (
              <Select.Item key={r.id} value={r.id}>
                {r.name} ({r.countries.length} улс)
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Icon (emoji)</Label>
          <Input
            value={(pricingConfig.regionIcon as string) || ''}
            onChange={(e) => onFieldChange('regionIcon', e.target.value)}
            placeholder="🌏"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Тайлбар</Label>
          <Input
            value={(pricingConfig.regionDescription as string) || ''}
            onChange={(e) => onFieldChange('regionDescription', e.target.value)}
            placeholder="Азийн орнууд"
          />
        </div>
      </div>

      <div className="space-y-2 mt-3 pt-3 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">
            Хамрагдах улсууд ({countries.length})
          </Label>
          <span className="text-xs text-muted-foreground">
            Гараар нэмж/хасаж болно
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCountry(newCountry);
              }
            }}
            placeholder="Улсын нэр бичээд Enter дарна"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addCountry(newCountry)}
          >
            <IconPlus size={14} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {countries.map((country) => (
            <span
              key={country}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border rounded text-xs"
            >
              {country}
              <button
                type="button"
                onClick={() =>
                  onFieldChange(
                    'countries',
                    countries.filter((c) => c !== country),
                  )
                }
                className="text-red-400 hover:text-red-600"
              >
                <IconX size={12} />
              </button>
            </span>
          ))}
        </div>
        {countries.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Бүс нутаг сонгоход улсууд автоматаар нэмэгдэнэ.
          </p>
        )}
      </div>
    </div>
  );
};

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
  const { regions } = useRegions();

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
    regionIds: [] as string[],
  });
  const [showPdfEditor, setShowPdfEditor] = useState(false);

  const [pricingMode, setPricingMode] = useState<
    'percentage' | 'baseRate' | 'dailyRate' | 'durationTiers' | 'formula'
  >('percentage');
  const [newCountry, setNewCountry] = useState('');

  const [formulas, setFormulas] = useState<
    {
      regionId: string;
      regionName: string;
      slope21: number;
      intercept21: number;
      slope21plus: number;
      intercept21plus: number;
    }[]
  >([]);

  const handlePricingFieldChange = (field: string, value: unknown) => {
    setFormData({
      ...formData,
      pricingConfig: { ...formData.pricingConfig, [field]: value },
    });
  };

  const updateDurationTiers = (
    updated: { minDays: number; maxDays: number; fee: number }[],
  ) => {
    setDurationTiers(updated);
    setFormData({
      ...formData,
      pricingConfig: { ...formData.pricingConfig, durationTiers: updated },
    });
  };

  const syncPercentageByDuration = (
    fields: { duration: string; percentage: number }[],
  ) => {
    const percentageByDuration: Record<string, number> = {};
    fields.forEach((f) => {
      if (f.duration) percentageByDuration[f.duration] = f.percentage;
    });
    setFormData({
      ...formData,
      pricingConfig: { ...formData.pricingConfig, percentageByDuration },
    });
  };

  const [durationFields, setDurationFields] = useState<
    { duration: string; percentage: number }[]
  >([]);

  const [durationTiers, setDurationTiers] = useState<
    { minDays: number; maxDays: number; fee: number }[]
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
        regionIds: product.regions?.map((r: any) => r.id) || [],
      });

      // Detect pricing mode from existing config
      const pc = product.pricingConfig as any;
      if (pc?.formulas && pc.formulas.length > 0) {
        setPricingMode('formula');
        setFormulas(pc.formulas);
      } else if (pc?.durationTiers && pc.durationTiers.length > 0) {
        setPricingMode('durationTiers');
        setDurationTiers(pc.durationTiers);
      } else if (pc?.dailyRate) {
        setPricingMode('dailyRate');
      } else if (pc?.baseRate) {
        setPricingMode('baseRate');
      } else {
        setPricingMode('percentage');
      }

      const percentageByDuration = pc?.percentageByDuration;
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
        regionIds: [],
      });
      setDurationFields([]);
      setDurationTiers([]);
      setFormulas([]);
      setPricingMode('percentage');
    }
  }, [product, open]);

  /**
   * Adds a new risk to the covered risks list
   */
  const handleAddRisk = () => {
    setFormData({
      ...formData,
      coveredRisks: [
        ...formData.coveredRisks,
        { riskId: '', coveragePercentage: 100 },
      ],
    });
  };

  /**
   * Removes a risk from the covered risks list
   * @param index - The index of the risk to remove
   */
  const handleRemoveRisk = (index: number) => {
    setFormData({
      ...formData,
      coveredRisks: formData.coveredRisks.filter((_, i) => i !== index),
    });
  };

  /**
   * Updates a specific field of a risk in the covered risks list
   * @param index - The index of the risk to update
   * @param field - The field to update (riskId or coveragePercentage)
   * @param value - The new value for the field
   */
  const handleRiskChange = (
    index: number,
    field: 'riskId' | 'coveragePercentage',
    value: string | number,
  ) => {
    const newRisks = [...formData.coveredRisks];
    newRisks[index] = { ...newRisks[index], [field]: value };
    setFormData({ ...formData, coveredRisks: newRisks });
  };

  /**
   * Handles form submission for creating or updating a product
   * @param e - The form event
   */
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
            regionIds: formData.regionIds,
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
            regionIds: formData.regionIds,
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
      <Dialog.Content className="max-h-[90vh] overflow-y-auto">
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

          {/* Region Selection - only for citizen/travel insurance */}
          {insuranceTypes.find((t) =>
            t.id === (product?.insuranceType?.id || formData.insuranceTypeId),
          )?.isCitizen && (
            <div className="space-y-2">
              <Label>Бүс нутаг сонгох</Label>
              <div className="flex flex-wrap gap-2">
                {regions.map((r) => {
                  const isSelected = formData.regionIds.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        const newIds = isSelected
                          ? formData.regionIds.filter((id) => id !== r.id)
                          : [...formData.regionIds, r.id];
                        setFormData({ ...formData, regionIds: newIds });
                      }}
                      className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {r.name}
                      <span className="ml-1 text-xs opacity-70">
                        ({r.countries.length})
                      </span>
                    </button>
                  );
                })}
              </div>
              {formData.regionIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formData.regionIds.length} бүс нутаг сонгогдсон —{' '}
                  {regions
                    .filter((r) => formData.regionIds.includes(r.id))
                    .reduce((sum, r) => sum + r.countries.length, 0)}{' '}
                  улс хамрагдана
                </p>
              )}
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
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                  <span className="text-sm font-medium text-green-700">
                    ✓ PDF template configured
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPdfEditor(!showPdfEditor)}
                      className="bg-white"
                    >
                      {showPdfEditor ? 'Hide Editor' : 'Edit Template'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData({ ...formData, pdfContent: '' })
                      }
                      className="bg-white text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                {showPdfEditor && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      HTML Template Editor
                    </Label>
                    <textarea
                      value={formData.pdfContent}
                      onChange={(e) =>
                        setFormData({ ...formData, pdfContent: e.target.value })
                      }
                      className="w-full h-[400px] p-3 font-mono text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter HTML template..."
                    />
                    <p className="text-xs text-gray-500">
                      Use variables like {'{{contractNumber}}'},{' '}
                      {'{{customerName}}'}, etc.
                    </p>
                  </div>
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
            {/* Pricing Mode Selector */}
            <div className="space-y-2">
              <Label>Үнийн тооцооны төрөл *</Label>
              <Select
                value={pricingMode}
                onValueChange={(
                  value:
                    | 'percentage'
                    | 'baseRate'
                    | 'dailyRate'
                    | 'durationTiers',
                ) => {
                  setPricingMode(value);
                  if (value === 'durationTiers') {
                    setFormData({
                      ...formData,
                      pricingConfig: {
                        coverageAmount:
                          (formData.pricingConfig.coverageAmount as number) ||
                          20000,
                        coverageCurrency: 'USD',
                        durationTiers:
                          durationTiers.length > 0
                            ? durationTiers
                            : [
                                { minDays: 1, maxDays: 7, fee: 30000 },
                                { minDays: 8, maxDays: 15, fee: 50000 },
                                { minDays: 16, maxDays: 30, fee: 80000 },
                              ],
                        region: (formData.pricingConfig.region as string) || '',
                        regionName:
                          (formData.pricingConfig.regionName as string) || '',
                        regionIcon:
                          (formData.pricingConfig.regionIcon as string) || '✈️',
                        regionDescription:
                          (formData.pricingConfig
                            .regionDescription as string) || '',
                      },
                    });
                    if (durationTiers.length === 0) {
                      setDurationTiers([
                        { minDays: 1, maxDays: 7, fee: 30000 },
                        { minDays: 8, maxDays: 15, fee: 50000 },
                        { minDays: 16, maxDays: 30, fee: 80000 },
                      ]);
                    }
                  } else if (value === 'percentage') {
                    setFormData({
                      ...formData,
                      pricingConfig: {
                        percentage:
                          (formData.pricingConfig.percentage as number) || 3,
                      },
                    });
                  } else if (value === 'formula') {
                    const selectedRegions =
                      formData.regionIds.length > 0
                        ? regions.filter((r) =>
                            formData.regionIds.includes(r.id),
                          )
                        : regions;
                    const defaultFormulas = selectedRegions.map((r) => ({
                      regionId: r.id,
                      regionName: r.name,
                      slope21: 0,
                      intercept21: 0,
                      slope21plus: 0,
                      intercept21plus: 0,
                    }));
                    const existing =
                      formulas.length > 0 ? formulas : defaultFormulas;
                    setFormulas(existing);
                    setFormData({
                      ...formData,
                      pricingConfig: {
                        formulas: existing,
                        coverageAmount:
                          (formData.pricingConfig.coverageAmount as number) ||
                          20000,
                        coverageCurrency: 'USD',
                      },
                    });
                  }
                }}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="percentage">
                    Хувиар (Тээврийн хэрэгсэл)
                  </Select.Item>
                  <Select.Item value="formula">
                    Томъёо y=ax+b (Гадаад зорчигч)
                  </Select.Item>
                </Select.Content>
              </Select>
            </div>

            {/* === PERCENTAGE MODE (Vehicle Insurance) === */}
            {pricingMode === 'percentage' && (
              <>
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
                    Хураамж = Үнэлгээ × Хувь
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">
                      Хугацааны хувь (сонголттой)
                    </Label>
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
                        <div
                          key={field.duration || `dur-${index}`}
                          className="flex gap-2 items-end"
                        >
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
                                syncPercentageByDuration(newFields);
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
                                syncPercentageByDuration(newFields);
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
                              syncPercentageByDuration(newFields);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* === FORMULA MODE (Travel - y = ax + b) === */}
            {pricingMode === 'formula' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="coverageAmount">
                    Нөхөн олговрын хэмжээ (USD)
                  </Label>
                  <Input
                    id="coverageAmount"
                    type="number"
                    min="0"
                    value={
                      (formData.pricingConfig.coverageAmount as number) || ''
                    }
                    onChange={(e) =>
                      handlePricingFieldChange(
                        'coverageAmount',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    placeholder="20000"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Бүс нутгийн томъёо (y = ax + b, мянган ₮)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    x = аялалын хоног, y = хураамж (мянган ₮)
                  </p>

                  {/* Header */}
                  <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 text-xs font-semibold text-center border-b pb-2">
                    <div>Бүс нутаг</div>
                    <div>≤21 хоног</div>
                    <div>&gt;21 хоног</div>
                  </div>

                  {formulas.map((f, idx) => (
                    <div
                      key={f.regionId || `formula-${idx}`}
                      className="grid grid-cols-[1fr_1fr_1fr] gap-2 items-center border-b pb-2"
                    >
                      <div className="text-sm font-medium truncate">
                        {f.regionName}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span>y=</span>
                        <Input
                          type="number"
                          step="0.01"
                          className="w-16 h-7 text-xs"
                          value={f.slope21}
                          onChange={(e) => {
                            const updated = [...formulas];
                            updated[idx] = {
                              ...updated[idx],
                              slope21: parseFloat(e.target.value) || 0,
                            };
                            setFormulas(updated);
                            handlePricingFieldChange('formulas', updated);
                          }}
                        />
                        <span>x+</span>
                        <Input
                          type="number"
                          step="0.1"
                          className="w-16 h-7 text-xs"
                          value={f.intercept21}
                          onChange={(e) => {
                            const updated = [...formulas];
                            updated[idx] = {
                              ...updated[idx],
                              intercept21: parseFloat(e.target.value) || 0,
                            };
                            setFormulas(updated);
                            handlePricingFieldChange('formulas', updated);
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span>y=</span>
                        <Input
                          type="number"
                          step="0.01"
                          className="w-16 h-7 text-xs"
                          value={f.slope21plus}
                          onChange={(e) => {
                            const updated = [...formulas];
                            updated[idx] = {
                              ...updated[idx],
                              slope21plus: parseFloat(e.target.value) || 0,
                            };
                            setFormulas(updated);
                            handlePricingFieldChange('formulas', updated);
                          }}
                        />
                        <span>x+</span>
                        <Input
                          type="number"
                          step="0.1"
                          className="w-16 h-7 text-xs"
                          value={f.intercept21plus}
                          onChange={(e) => {
                            const updated = [...formulas];
                            updated[idx] = {
                              ...updated[idx],
                              intercept21plus: parseFloat(e.target.value) || 0,
                            };
                            setFormulas(updated);
                            handlePricingFieldChange('formulas', updated);
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <p className="text-xs text-muted-foreground">
                    Жишээ: Asia ≤21 хоног, y=0.7x+1.9 → 10 хоног = 0.7×10+1.9 =
                    8.9 мянган₮ = 8,900₮
                  </p>
                </div>
              </>
            )}
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
