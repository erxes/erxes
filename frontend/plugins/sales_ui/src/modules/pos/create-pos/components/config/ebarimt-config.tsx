import { Input, MultipleSelector, Checkbox, Label, Textarea } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ebarimtConfigSettingsAtom } from '../../states/posCategory';
import { IPosDetail } from '@/pos/pos-detail/types/IPos';
import { EbarimtConfigFormValues } from '../formSchema';
import queries from '@/pos/graphql/queries';

interface EbarimtConfigFormProps {
  posDetail?: IPosDetail;
  onDataChange?: (data: EbarimtConfigFormValues) => void;
}

export default function EbarimtConfigForm({
  posDetail,
  onDataChange,
}: EbarimtConfigFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ebarimtConfig, setEbarimtConfig] = useAtom(ebarimtConfigSettingsAtom);

  //  VAT rules
  const { data: vatRulesData } = useQuery(queries.ebarimtProductRules, {
    variables: { kind: 'vat' },
  });

  //  city tax rules
  const { data: ctaxRulesData } = useQuery(queries.ebarimtProductRules, {
    variables: { kind: 'ctax' },
  });

  const vatRules = (vatRulesData?.ebarimtProductRules?.list || []).map(
    (rule: { _id: string; title: string }) => ({
      value: rule._id,
      label: rule.title,
    }),
  );
  const ctaxRules = (ctaxRulesData?.ebarimtProductRules?.list || []).map(
    (rule: { _id: string; title: string }) => ({
      value: rule._id,
      label: rule.title,
    }),
  );

  const getSelectedOptions = (
    value: string | string[],
    options: Array<{ value: string; label: string }>,
  ) => {
    if (!value) return [];
    const ids = Array.isArray(value) ? value : value.split(',').filter(Boolean);
    return options.filter((opt) => ids.includes(opt.value));
  };

  useEffect(() => {
    if (posDetail?.ebarimtConfig) {
      const config = posDetail.ebarimtConfig;
      setEbarimtConfig({
        companyName: config.companyName || '',
        ebarimtUrl: config.ebarimtUrl || '',
        checkTaxpayerUrl: config.checkCompanyUrl || '',
        checkCompanyUrl: config.checkCompanyUrl || '',
        companyRd: config.companyRD || '',
        companyRD: config.companyRD || '',
        merchantin: '',
        posno: '',
        districtCode: config.districtCode || '',
        branchNo: '',
        defaultGsCode: config.defaultGSCode || '',
        defaultGSCode: config.defaultGSCode || '',
        hasVat: config.hasVat || false,
        hasCitytax: config.hasCitytax || false,
        vatPercent: config.vatPercent?.toString() || '0',
        hasUbCityTax: config.hasCitytax || false,
        ubCityTaxPercent: config.cityTaxPercent?.toString() || '0',
        cityTaxPercent: config.cityTaxPercent || 0,
        anotherRuleOfProductsOnCityTax: Array.isArray(config.reverseCtaxRules)
          ? config.reverseCtaxRules
          : config.reverseCtaxRules
          ? [config.reverseCtaxRules]
          : [],
        anotherRuleOfProductsOnVat: Array.isArray(config.reverseVatRules)
          ? config.reverseVatRules
          : config.reverseVatRules
          ? [config.reverseVatRules]
          : [],
        defaultPay: config.defaultPay || 'debtAmount',
        headerText: config.headerText || '',
        footerText: config.footerText || '',
        hasCopy: config.hasCopy || false,
        hasSummaryQty: config.hasSumQty || false,
        hasSumQty: config.hasSumQty || false,
      });
    }
  }, [posDetail, setEbarimtConfig]);

  const handleCheckboxChange = (
    field: keyof typeof ebarimtConfig,
    checked: boolean,
  ) => {
    const updatedConfig = {
      ...ebarimtConfig,
      [field]: checked,
    };
    setEbarimtConfig(updatedConfig);
  };

  const handleInputChange = (
    field: keyof typeof ebarimtConfig,
    value: string,
  ) => {
    const updatedConfig = {
      ...ebarimtConfig,
      [field]: value,
    };
    setEbarimtConfig(updatedConfig);
  };

  const handleSelectChange = (
    field: keyof typeof ebarimtConfig,
    value: string,
  ) => {
    const updatedConfig = {
      ...ebarimtConfig,
      [field]: value,
    };
    setEbarimtConfig(updatedConfig);
  };

  const handleMultiSelectChange = (
    field: keyof typeof ebarimtConfig,
    options: Array<{ value: string; label: string }>,
  ) => {
    const values = options.map((opt) => opt.value);
    const updatedConfig = {
      ...ebarimtConfig,
      [field]: values,
    };
    setEbarimtConfig(updatedConfig);
  };

  useEffect(() => {
    if (onDataChange) {
      const transformedConfig: EbarimtConfigFormValues = {
        companyName: ebarimtConfig.companyName,
        ebarimtUrl: ebarimtConfig.ebarimtUrl,
        checkCompanyUrl:
          ebarimtConfig.checkTaxpayerUrl || ebarimtConfig.checkCompanyUrl || '',
        hasVat: ebarimtConfig.hasVat,
        hasCitytax: ebarimtConfig.hasUbCityTax,
        defaultPay: 'debtAmount',
        districtCode: ebarimtConfig.districtCode,
        companyRD: ebarimtConfig.companyRd,
        defaultGSCode: ebarimtConfig.defaultGsCode,
        vatPercent:
          typeof ebarimtConfig.vatPercent === 'string'
            ? parseFloat(ebarimtConfig.vatPercent) || 0
            : 0,
        cityTaxPercent:
          typeof ebarimtConfig.ubCityTaxPercent === 'string'
            ? parseFloat(ebarimtConfig.ubCityTaxPercent) || 0
            : 0,
        headerText: ebarimtConfig.headerText,
        footerText: ebarimtConfig.footerText,
        hasCopy: ebarimtConfig.hasCopy,
        hasSumQty: ebarimtConfig.hasSummaryQty,
        reverseVatRules: Array.isArray(ebarimtConfig.anotherRuleOfProductsOnVat)
          ? ebarimtConfig.anotherRuleOfProductsOnVat
          : ebarimtConfig.anotherRuleOfProductsOnVat
          ? ebarimtConfig.anotherRuleOfProductsOnVat.split(',').filter(Boolean)
          : undefined,
        reverseCtaxRules: Array.isArray(
          ebarimtConfig.anotherRuleOfProductsOnCityTax,
        )
          ? ebarimtConfig.anotherRuleOfProductsOnCityTax
          : ebarimtConfig.anotherRuleOfProductsOnCityTax
          ? ebarimtConfig.anotherRuleOfProductsOnCityTax
              .split(',')
              .filter(Boolean)
          : undefined,
      };
      onDataChange(transformedConfig);
    }
  }, [ebarimtConfig, onDataChange]);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log('Ebarimt config form submitted:', ebarimtConfig);

    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', 'finance');
    setSearchParams(newParams);
  };

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <div className="space-y-6">
        <div>
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-medium text-primary">Main</h2>
          </div>

          <div className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">COMPANY NAME</Label>
                <Input
                  value={ebarimtConfig.companyName}
                  onChange={(e) =>
                    handleInputChange('companyName', e.target.value)
                  }
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">EBARIMT URL</Label>
                <Input
                  value={ebarimtConfig.ebarimtUrl}
                  onChange={(e) =>
                    handleInputChange('ebarimtUrl', e.target.value)
                  }
                  placeholder="Enter ebarimt URL"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  CHECK TAXPAYER URL
                </Label>
                <Input
                  value={ebarimtConfig.checkTaxpayerUrl}
                  onChange={(e) =>
                    handleInputChange('checkTaxpayerUrl', e.target.value)
                  }
                  placeholder="Enter taxpayer URL"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-medium text-primary">Other</h2>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">COMPANYRD</Label>
                <Input
                  value={ebarimtConfig.companyRd}
                  onChange={(e) =>
                    handleInputChange('companyRd', e.target.value)
                  }
                  placeholder="Enter company RD"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">MERCHANTIN</Label>
                <Input
                  value={ebarimtConfig.merchantin}
                  onChange={(e) =>
                    handleInputChange('merchantin', e.target.value)
                  }
                  placeholder="Enter merchant ID"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">POSNO</Label>
                <Input
                  value={ebarimtConfig.posno}
                  onChange={(e) => handleInputChange('posno', e.target.value)}
                  placeholder="Enter POS number"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">DISTRICTCODE</Label>
                <Input
                  value={ebarimtConfig.districtCode}
                  onChange={(e) =>
                    handleInputChange('districtCode', e.target.value)
                  }
                  placeholder="Enter district code"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">BRANCHNO</Label>
                <Input
                  value={ebarimtConfig.branchNo}
                  onChange={(e) =>
                    handleInputChange('branchNo', e.target.value)
                  }
                  placeholder="Enter branch number"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">DEFAULTGSCODE</Label>
                <Input
                  value={ebarimtConfig.defaultGsCode}
                  onChange={(e) =>
                    handleInputChange('defaultGsCode', e.target.value)
                  }
                  placeholder="Enter default GS code"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-medium uppercase text-primary">VAT</h2>
          </div>

          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">HAS VAT</Label>

                <div className="flex items-center h-8">
                  <Checkbox
                    checked={ebarimtConfig.hasVat}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('hasVat', Boolean(checked))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">VAT PERCENT</Label>
                <Input
                  value={ebarimtConfig.vatPercent}
                  onChange={(e) =>
                    handleInputChange('vatPercent', e.target.value)
                  }
                  placeholder="0"
                />
              </div>
            </div>

            {ebarimtConfig.hasVat && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  ANOTHER RULE OF PRODUCTS ON VAT
                </Label>
                <MultipleSelector
                  value={getSelectedOptions(
                    ebarimtConfig.anotherRuleOfProductsOnVat,
                    vatRules,
                  )}
                  onChange={(options) =>
                    handleMultiSelectChange(
                      'anotherRuleOfProductsOnVat',
                      options,
                    )
                  }
                  options={vatRules}
                  placeholder="Select VAT rules"
                  emptyIndicator="No VAT rules found"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-medium text-primary">UB city tax</h2>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">HAS UB CITY TAX</Label>

                <div className="flex items-center h-8">
                  <Checkbox
                    checked={ebarimtConfig.hasUbCityTax}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('hasUbCityTax', Boolean(checked))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  UB CITY TAX PERCENT
                </Label>

                <Input
                  value={ebarimtConfig.ubCityTaxPercent}
                  onChange={(e) =>
                    handleInputChange('ubCityTaxPercent', e.target.value)
                  }
                  placeholder="0"
                />
              </div>
            </div>

            {!ebarimtConfig.hasUbCityTax && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  ANOTHER RULE OF PRODUCTS ON CITY TAX
                </Label>
                <MultipleSelector
                  value={getSelectedOptions(
                    ebarimtConfig.anotherRuleOfProductsOnCityTax,
                    ctaxRules,
                  )}
                  onChange={(options) =>
                    handleMultiSelectChange(
                      'anotherRuleOfProductsOnCityTax',
                      options,
                    )
                  }
                  options={ctaxRules}
                  placeholder="Select city tax rules"
                  emptyIndicator="No city tax rules found"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex gap-2 items-center">
            <h2 className="text-xl font-medium text-primary">UI Config</h2>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">HEADER TEXT</Label>
                <Textarea
                  value={ebarimtConfig.headerText}
                  onChange={(e) =>
                    handleInputChange('headerText', e.target.value)
                  }
                  placeholder="Enter header text"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">FOOTER TEXT</Label>
                <Textarea
                  value={ebarimtConfig.footerText}
                  onChange={(e) =>
                    handleInputChange('footerText', e.target.value)
                  }
                  placeholder="Enter footer text"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">HAS COPY</Label>

                <div className="flex items-center h-8">
                  <Checkbox
                    checked={ebarimtConfig.hasCopy}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('hasCopy', Boolean(checked))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">HAS SUMMARY QTY</Label>

                <div className="flex items-center h-8">
                  <Checkbox
                    checked={ebarimtConfig.hasSummaryQty}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('hasSummaryQty', Boolean(checked))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
