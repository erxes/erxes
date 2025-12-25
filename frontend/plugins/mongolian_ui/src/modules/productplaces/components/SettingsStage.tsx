// frontend/plugins/mongolian_ui/src/modules/productplaces/components/SettingsStage.tsx
import React, { useState } from 'react';
import { Button } from 'erxes-ui';
import { contentBoxClass } from '../styles';
import { IConfigsMap, PerPrintConfig } from '../types';
import PerPrint from './PerPrint';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const SettingsStage = (props: Props) => {
  console.log('SettingsStage rendered!', { 
    hasProps: !!props,
    hasConfigsMap: !!props.configsMap,
    configsMapKeys: Object.keys(props.configsMap || {})
  });

  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  const add = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Add button clicked!');

    const newPlacesConfig: PerPrintConfig = {
      title: 'New Places Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      conditions: [],
    };

    const configKey = `config_${Date.now()}`;
    
    setConfigsMap(prev => ({
      ...prev,
      dealsProductsDataPlaces: {
        ...(prev.dealsProductsDataPlaces || {}),
        [configKey]: newPlacesConfig
      }
    }));
  };

  const renderConfigs = () => {
    const configs = configsMap.dealsProductsDataPlaces || {};
    console.log('Rendering configs:', configs);
    return Object.keys(configs).map((key) => {
      return (
        <PerPrint
          key={key}
          config={configs[key] as PerPrintConfig}
          currentConfigKey={key}
          save={() => {}}
          delete={() => {}}
        />
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* SIMPLE Title for Settings */}
      <div className="border-b pb-4">
        <h2 className="text-lg font-semibold">Stage Configuration</h2>
        <p className="text-sm text-gray-500">
          Configure product stage settings
        </p>
      </div>

      {/* New Config Button */}
      <div className="flex justify-end">
        <Button variant="default" onClick={add} className="flex items-center gap-2">
          + New Config
        </Button>
      </div>

      {/* Configs List */}
      <div className={contentBoxClass}>
        {renderConfigs()}
      </div>
    </div>
  );
};

export default SettingsStage;