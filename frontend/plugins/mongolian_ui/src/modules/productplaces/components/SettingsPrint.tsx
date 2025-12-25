
import React, { useState } from 'react';
import { Button } from 'erxes-ui';
import { contentBoxClass } from '../styles';
import { IConfigsMap, PerPrintConfig } from '../types';
import PerPrint from './PerPrint';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const SettingsPrint = (props: Props) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  const add = (e: React.MouseEvent) => {
    e.preventDefault();

    const newPrintConfig: PerPrintConfig = {
      title: 'New Print Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      conditions: [],
    };

    const configKey = `config_${Date.now()}`;
    
    setConfigsMap(prev => ({
      ...prev,
      dealsProductsDataPrint: {
        ...(prev.dealsProductsDataPrint || {}),
        [configKey]: newPrintConfig
      }
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    const updatedConfigsMap = { ...configsMap };
    
    if (updatedConfigsMap.dealsProductsDataPrint) {
      delete updatedConfigsMap.dealsProductsDataPrint[currentConfigKey];
    }

    setConfigsMap(updatedConfigsMap);
    props.save(updatedConfigsMap);
  };

  const saveHandler = (key: string, config: PerPrintConfig) => {
    const updatedConfigsMap = { ...configsMap };
    
    if (!updatedConfigsMap.dealsProductsDataPrint) {
      updatedConfigsMap.dealsProductsDataPrint = {};
    }
    
    updatedConfigsMap.dealsProductsDataPrint[key] = config;
    
    setConfigsMap(updatedConfigsMap);
    props.save(updatedConfigsMap);
  };

  const renderConfigs = () => {
    const configs = configsMap.dealsProductsDataPrint || {};
    return Object.keys(configs).map((key) => {
      return (
        <PerPrint
          key={key}
          config={configs[key] as PerPrintConfig}
          currentConfigKey={key}
          save={saveHandler}
          delete={deleteHandler}
        />
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <h2 className="text-lg font-semibold">Print Configuration</h2>
        <p className="text-sm text-gray-500">
          Configure product print settings
        </p>
      </div>

      <div className="flex justify-end">
        <Button variant="default" onClick={add} className="flex items-center gap-2">
          + New Config
        </Button>
      </div>

      <div className={contentBoxClass}>
        {renderConfigs()}
      </div>
    </div>
  );
};

export default SettingsPrint;