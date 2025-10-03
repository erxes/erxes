import { Input, Select, Checkbox, Label, Collapsible } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { ebarimtConfigSettingsAtom } from '../../states/posCategory';
import { IPosDetail } from '@/pos-detail/types/IPos';

interface EbarimtConfigFormProps {
  posDetail?: IPosDetail;
}

export default function EbarimtConfigForm({
  posDetail,
}: EbarimtConfigFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ebarimtConfig, setEbarimtConfig] = useAtom(ebarimtConfigSettingsAtom);

  const handleCheckboxChange = (
    field: keyof typeof ebarimtConfig,
    checked: boolean,
  ) => {
    setEbarimtConfig({
      ...ebarimtConfig,
      [field]: checked,
    });
  };

  const handleInputChange = (
    field: keyof typeof ebarimtConfig,
    value: string,
  ) => {
    setEbarimtConfig({
      ...ebarimtConfig,
      [field]: value,
    });
  };

  const handleSelectChange = (
    field: keyof typeof ebarimtConfig,
    value: string,
  ) => {
    setEbarimtConfig({
      ...ebarimtConfig,
      [field]: value,
    });
  };

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
        <Collapsible defaultOpen>
          <Collapsible.TriggerButton className="flex items-center gap-2">
            <Collapsible.TriggerIcon size={16} />
            <h2 className="text-indigo-600 text-xl font-medium">MAIN</h2>
          </Collapsible.TriggerButton>

          <Collapsible.Content className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">COMPANY NAME</Label>
                <Input
                  value={ebarimtConfig.companyName}
                  onChange={(e) =>
                    handleInputChange('companyName', e.target.value)
                  }
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">EBARIMT URL</Label>
                <Input
                  value={ebarimtConfig.ebarimtUrl}
                  onChange={(e) =>
                    handleInputChange('ebarimtUrl', e.target.value)
                  }
                  placeholder="Enter ebarimt URL"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">
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
          </Collapsible.Content>
        </Collapsible>
        <Collapsible defaultOpen>
          <Collapsible.TriggerButton className="flex items-center gap-2">
            <Collapsible.TriggerIcon size={16} />
            <h2 className="text-indigo-600 text-xl font-medium">OTHER</h2>
          </Collapsible.TriggerButton>

          <Collapsible.Content className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">COMPANYRD</Label>
                <Input
                  value={ebarimtConfig.companyRd}
                  onChange={(e) =>
                    handleInputChange('companyRd', e.target.value)
                  }
                  placeholder="Enter company RD"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">MERCHANTIN</Label>
                <Input
                  value={ebarimtConfig.merchantin}
                  onChange={(e) =>
                    handleInputChange('merchantin', e.target.value)
                  }
                  placeholder="Enter merchant ID"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">POSNO</Label>
                <Input
                  value={ebarimtConfig.posno}
                  onChange={(e) => handleInputChange('posno', e.target.value)}
                  placeholder="Enter POS number"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">DISTRICTCODE</Label>
                <Input
                  value={ebarimtConfig.districtCode}
                  onChange={(e) =>
                    handleInputChange('districtCode', e.target.value)
                  }
                  placeholder="Enter district code"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">BRANCHNO</Label>
                <Input
                  value={ebarimtConfig.branchNo}
                  onChange={(e) =>
                    handleInputChange('branchNo', e.target.value)
                  }
                  placeholder="Enter branch number"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">DEFAULTGSCODE</Label>
                <Input
                  value={ebarimtConfig.defaultGsCode}
                  onChange={(e) =>
                    handleInputChange('defaultGsCode', e.target.value)
                  }
                  placeholder="Enter default GS code"
                />
              </div>
            </div>
          </Collapsible.Content>
        </Collapsible>
        <Collapsible defaultOpen>
          <Collapsible.TriggerButton className="flex items-center gap-2">
            <Collapsible.TriggerIcon size={16} />
            <h2 className="text-indigo-600 text-xl font-medium">VAT</h2>
          </Collapsible.TriggerButton>

          <Collapsible.Content className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">HAS VAT</Label>
                <div className="h-10 flex items-center">
                  <Checkbox
                    checked={ebarimtConfig.hasVat}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('hasVat', Boolean(checked))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">VAT PERCENT</Label>
                <Input
                  value={ebarimtConfig.vatPercent}
                  onChange={(e) =>
                    handleInputChange('vatPercent', e.target.value)
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </Collapsible.Content>
        </Collapsible>
        <Collapsible defaultOpen>
          <Collapsible.TriggerButton className="flex items-center gap-2">
            <Collapsible.TriggerIcon size={16} />
            <h2 className="text-indigo-600 text-xl font-medium">UB CITY TAX</h2>
          </Collapsible.TriggerButton>

          <Collapsible.Content className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">HAS UB CITY TAX</Label>
                <div className="h-10 flex items-center">
                  <Checkbox
                    checked={ebarimtConfig.hasUbCityTax}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('hasUbCityTax', Boolean(checked))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">
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

            <div className="space-y-2">
              <Label className="text-sm text-gray-500">
                ANOTHER RULE OF PRODUCTS ON CITY TAX
              </Label>
              <Select
                value={ebarimtConfig.anotherRuleOfProductsOnCityTax}
                onValueChange={(value) =>
                  handleSelectChange('anotherRuleOfProductsOnCityTax', value)
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="reserveCtaxRules" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="reserveCtaxRules">
                    reserveCtaxRules
                  </Select.Item>
                  <Select.Item value="standardCtaxRules">
                    standardCtaxRules
                  </Select.Item>
                  <Select.Item value="exemptCtaxRules">
                    exemptCtaxRules
                  </Select.Item>
                  <Select.Item value="customCtaxRules">
                    customCtaxRules
                  </Select.Item>
                </Select.Content>
              </Select>
            </div>
          </Collapsible.Content>
        </Collapsible>
        <Collapsible>
          <Collapsible.TriggerButton className="flex items-center gap-2">
            <Collapsible.TriggerIcon size={16} />
            <h2 className="text-indigo-600 text-xl font-medium">UI CONFIG</h2>
          </Collapsible.TriggerButton>

          <Collapsible.Content className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500">HEADER TEXT</Label>
                <Input
                  value={ebarimtConfig.headerText}
                  onChange={(e) =>
                    handleInputChange('headerText', e.target.value)
                  }
                  placeholder="Enter header text"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">FOOTER TEXT</Label>
                <Input
                  value={ebarimtConfig.footerText}
                  onChange={(e) =>
                    handleInputChange('footerText', e.target.value)
                  }
                  placeholder="Enter footer text"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-500">HAS COPY</Label>
                <div className="h-10 flex items-center">
                  <Checkbox
                    checked={ebarimtConfig.hasCopy}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('hasCopy', Boolean(checked))
                    }
                  />
                </div>
              </div>
            </div>
          </Collapsible.Content>
        </Collapsible>
      </div>
    </form>
  );
}
