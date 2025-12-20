// frontend/plugins/mongolian_ui/src/modules/productplaces/components/PrintSettings.tsx

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
  const [configs, setConfigs] = useState<IConfigsMap>(props.configsMap.dealsProductsDataPrint || {});

  const add = (e: React.MouseEvent) => {
    e.preventDefault();

    // must save prev item saved then new item
    const newPrintConfig: PerPrintConfig = {
      title: 'New Print Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      conditions: [],
    };

    setConfigs((prevConfigsMap: IConfigsMap) => ({
      ...prevConfigsMap,
      newPrintConfig,
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    const dealsProductsDataPrint = { ...configs };
    delete dealsProductsDataPrint[currentConfigKey];
    delete dealsProductsDataPrint['newPrintConfig'];

    setConfigs({ ...dealsProductsDataPrint });
    props.save({ ...props.configsMap, dealsProductsDataPrint });
  };

  const saveHandler = (key: string, config: PerPrintConfig) => {
    const dealsProductsDataPrint = { ...configs };
    delete dealsProductsDataPrint['newPrintConfig'];
    dealsProductsDataPrint[key] = config;
    setConfigs({ ...dealsProductsDataPrint });
    props.save({ ...props.configsMap, dealsProductsDataPrint });
  };

  const renderConfigs = (configs: IConfigsMap) => {
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
        {renderConfigs(configs)}
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