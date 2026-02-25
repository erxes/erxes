import { useEffect, useState } from 'react';
import { gql, useApolloClient } from '@apollo/client';

import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';
import { Input } from 'erxes-ui/components/input';
import { Checkbox } from 'erxes-ui/components/checkbox';

import { BoardSelect } from 'ui-modules/modules/sales/components/BoardSelect';

import { IConfigsMap } from '../../types';
import { KEY_LABELS } from '../../constants';

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
  delete: (currentConfigKey: string) => void;
};

const PerSettings = ({
  configsMap,
  config: initialConfig,
  currentConfigKey,
  save,
  delete: deleteConfig,
}: Props) => {
  const [config, setConfig] = useState<any>(initialConfig);
  const [open, setOpen] = useState(currentConfigKey === 'newDYNAMIC');

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const handleChange = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const newKey = config.brandId;

    const updatedDynamic: any = {};

    Object.keys(configsMap?.DYNAMIC || {}).forEach((key) => {
      if (key !== currentConfigKey) {
        updatedDynamic[key] = configsMap?.DYNAMIC[key];
      }
    });

    updatedDynamic[newKey] = config;

    save({ ...configsMap, DYNAMIC: updatedDynamic });
  };

  const handleDelete = () => {
    deleteConfig(currentConfigKey);
  };

  const renderInput = (key: string, type = 'text') => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{KEY_LABELS[key] || key}</label>
      <Input
        type={type}
        value={config[key] || ''}
        onChange={(e) => handleChange(key, e.target.value)}
      />
    </div>
  );

  const renderCheckbox = (key: string) => (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={!!config[key]}
        onCheckedChange={(checked) => handleChange(key, checked)}
      />
      <label className="text-sm">{KEY_LABELS[key] || key}</label>
    </div>
  );

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <h3 className="text-lg font-semibold">{config.title}</h3>
      </div>

      {open && (
        <div className="space-y-8">
          {/* Basic Config */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              {renderInput('title')}
              {renderInput('brandId')}
              {renderInput('itemApi')}
              {renderInput('itemCategoryApi')}
              {renderInput('priceApi')}
              {renderInput('pricePriority')}
              {renderInput('username')}
              {renderInput('password', 'password')}
            </div>

            <div className="space-y-4">
              {renderInput('customerApi')}
              {renderInput('salesApi')}
              {renderInput('salesLineApi')}
              {renderInput('exchangeRateApi')}
              {renderCheckbox('useBoard')}

              {config.useBoard && (
                <BoardSelect
                  boardId={config.boardId}
                  onChange={(boardId) => handleChange('boardId', boardId)}
                />
              )}
            </div>
          </div>

          {/* General Settings */}
          <div>
            <h4 className="text-md font-semibold mb-4">General Settings</h4>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                {renderInput('genBusPostingGroup')}
                {renderInput('vatBusPostingGroup')}
                {renderInput('customerPostingGroup')}
                {renderInput('customerPricingGroup')}
                {renderInput('customerDiscGroup')}
                {renderInput('syncType')}
                {renderInput('defaultUserCode')}
              </div>

              <div className="space-y-4">
                {renderInput('locationCode')}
                {renderInput('reminderCode')}
                {renderInput('responsibilityCenter')}
                {renderInput('billType')}
                {renderInput('dealType')}
                {renderInput('paymentTermsCode')}
                {renderInput('paymentMethodCode')}
                {renderInput('defaultCompanyCode')}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>

            <Button onClick={handleSave} disabled={!config.brandId}>
              Save
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PerSettings;
