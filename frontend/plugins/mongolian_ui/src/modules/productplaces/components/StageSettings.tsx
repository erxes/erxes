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
  const [configs, setConfigs] = useState<IConfigsMap>(props.configsMap.dealsProductsDataPlaces || {});

  const add = (e: React.MouseEvent) => {
    e.preventDefault();

    // must save prev item saved then new item
    const newPlacesConfig: PerPrintConfig = {
      title: 'New Places Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      conditions: [],
    };

    setConfigs((prevConfigsMap: IConfigsMap) => ({
      ...prevConfigsMap,
      newPlacesConfig,
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    const dealsProductsDataPlaces = { ...configs };
    delete dealsProductsDataPlaces[currentConfigKey];
    delete dealsProductsDataPlaces['newPlacesConfig'];

    setConfigs({ ...dealsProductsDataPlaces });
    props.save({ ...props.configsMap, dealsProductsDataPlaces });
  };

  const saveHandler = (key: string, config: PerPrintConfig) => {
    const dealsProductsDataPlaces = { ...configs };
    delete dealsProductsDataPlaces['newPlacesConfig'];
    dealsProductsDataPlaces[key] = config;
    setConfigs({ ...dealsProductsDataPlaces });
    props.save({ ...props.configsMap, dealsProductsDataPlaces });
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
      <div 
        id={'StageSettingsMenu'}
        className={contentBoxClass}
      >
        {renderConfigs(configs)}
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