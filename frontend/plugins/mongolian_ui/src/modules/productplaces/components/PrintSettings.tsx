import React, { useState } from 'react';
import { Button } from 'erxes-ui';
import { ContentBox } from '../styles';
import { IConfigsMap, PerPrintConfig } from '../types';
import Header from './Header';
import PerPrint from './PerPrint';
import Sidebar from './Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const PrintSettings = (props: Props) => {
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

  const renderContent = () => {
    return (
      <ContentBox id={'PrintSettingsMenu'}>
        {renderConfigs()} 
      </ContentBox>
    );
  };

  const breadcrumb = [
    { title: 'Settings', link: '/settings' },
    { title: 'Print config' },
  ];

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
            <h1 className="text-xl font-semibold">Print config</h1>
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <a href="/settings" className="hover:text-gray-700">
                Settings
              </a>
              <span>/</span>
              <span className="text-gray-700">Print config</span>
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
          <div className="text-lg font-medium">Print configs</div>
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

export default PrintSettings;