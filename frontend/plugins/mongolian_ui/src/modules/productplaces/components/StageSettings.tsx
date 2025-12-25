import React, { useState } from 'react';
import { Button } from 'erxes-ui';
import { contentBoxClass } from '../styles';
import { IConfigsMap, PerPrintConfig } from '../types';
import Header from './Header';
import PerPrint from './PerPrint';
import Sidebar from './Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const StageSettings = (props: Props) => {
  // Initialize with the entire configsMap
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  const add = (e: React.MouseEvent) => {
    e.preventDefault();

    const newPlacesConfig: PerPrintConfig = {
      title: 'New Places Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      conditions: [],
    };

    // Create a new config key with a unique ID
    const configKey = `config_${Date.now()}`;
    
    setConfigsMap(prev => ({
      ...prev,
      dealsProductsDataPlaces: {
        ...(prev.dealsProductsDataPlaces || {}),
        [configKey]: newPlacesConfig
      }
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    const updatedConfigsMap = { ...configsMap };
    
    if (updatedConfigsMap.dealsProductsDataPlaces) {
      delete updatedConfigsMap.dealsProductsDataPlaces[currentConfigKey];
    }

    setConfigsMap(updatedConfigsMap);
    props.save(updatedConfigsMap);
  };

  const saveHandler = (key: string, config: PerPrintConfig) => {
    const updatedConfigsMap = { ...configsMap };
    
    if (!updatedConfigsMap.dealsProductsDataPlaces) {
      updatedConfigsMap.dealsProductsDataPlaces = {};
    }
    
    updatedConfigsMap.dealsProductsDataPlaces[key] = config;
    
    setConfigsMap(updatedConfigsMap);
    props.save(updatedConfigsMap);
  };

  const renderConfigs = () => {
    const configs = configsMap.dealsProductsDataPlaces || {};
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

  const renderContent = () => {
    return (
      <div 
        id={'StageSettingsMenu'}
        className={contentBoxClass}
      >
        {renderConfigs()}
      </div>
    );
  };

  const actionButtons = (
    <Button variant="default" onClick={add} className="flex items-center gap-2">
      New config
    </Button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Places config</h1>
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <a href="/settings" className="hover:text-gray-700">
                Settings
              </a>
              <span>/</span>
              <span className="text-gray-700">Places config</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Header Component */}
      <div className="p-4">
        <Header />
      </div>

      {/* Action Bar */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium">Places configs</div>
          <div>{actionButtons}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 border-r">
          <Sidebar />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StageSettings;