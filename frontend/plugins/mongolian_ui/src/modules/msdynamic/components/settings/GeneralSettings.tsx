import { useEffect, useState } from 'react';
import { Button } from 'erxes-ui/components/button';
import { Card } from 'erxes-ui/components/card';

import { IConfigsMap } from '../../types';
import PerSettings from './PerSettings';
import SettingSideBar from './SettingSideBar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const emptyDynamicConfig = {
  title: 'New MSDynamic Config',
  brandId: '',
  itemApi: '',
  itemCategoryApi: '',
  pricePriority: '',
  priceApi: '',
  customerApi: '',
  salesApi: '',
  salesLineApi: '',
  exchangeRateApi: '',
  username: '',
  password: '',
  genBusPostingGroup: '',
  vatBusPostingGroup: '',
  paymentTermsCode: '',
  paymentMethodCode: '',
  customerPostingGroup: '',
  customerPricingGroup: '',
  customerDiscGroup: '',
  locationCode: '',
  reminderCode: '',
  responsibilityCenter: '',
  billType: '',
  dealType: '',
  syncType: '',
  defaultUserCode: '',
  defaultCompanyCode: '',
};

const GeneralSettings = ({ save, configsMap }: Props) => {
  const [localConfigs, setLocalConfigs] =
    useState<IConfigsMap>(configsMap || {});

  useEffect(() => {
    setLocalConfigs(configsMap || {});
  }, [configsMap]);

  const handleAdd = () => {
    setLocalConfigs((prev) => ({
      ...prev,
      DYNAMIC: {
        ...prev?.DYNAMIC,
        newDYNAMIC: emptyDynamicConfig,
      },
    }));
  };

  const handleDelete = (currentConfigKey: string) => {
    if (!window.confirm('This will delete this config. Are you sure?'))
      return;

    const updatedDynamic = Object.keys(
      localConfigs?.DYNAMIC || {},
    ).reduce((acc: any, key) => {
      if (key !== currentConfigKey) {
        acc[key] = localConfigs?.DYNAMIC[key];
      }
      return acc;
    }, {});

    const updated = {
      ...localConfigs,
      DYNAMIC: updatedDynamic,
    };

    setLocalConfigs(updated);
    save(updated);
  };

  const renderConfigs = () => {
    const configs = localConfigs?.DYNAMIC || {};

    return Object.keys(configs).map((key) => (
      <PerSettings
        key={key}
        configsMap={localConfigs}
        config={configs[key]}
        currentConfigKey={key}
        save={save}
        delete={handleDelete}
      />
    ));
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64">
        <SettingSideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Msdynamics config
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage Microsoft Dynamics integration settings.
            </p>
          </div>

          <Button onClick={handleAdd}>
            New config
          </Button>
        </div>

        {/* Config List */}
        <Card className="p-6 space-y-6">
          {renderConfigs()}
        </Card>
      </div>
    </div>
  );
};

export default GeneralSettings;