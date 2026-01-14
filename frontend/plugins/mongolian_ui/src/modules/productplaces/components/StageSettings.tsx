import React from 'react';
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

const StageSettings = ({ configsMap, save }: Props) => {
  /* =========================
   * ADD NEW CONFIG
   * ========================= */
  const add = (e: React.MouseEvent) => {
    e.preventDefault();

    const configKey = `config_${Date.now()}`;

    const newPlacesConfig: PerPrintConfig = {
      title: 'New Places Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      conditions: [],
    };

    save({
      ...configsMap,
      dealsProductsDataPlaces: {
        ...(configsMap.dealsProductsDataPlaces),
        [configKey]: newPlacesConfig,
      },
    });
  };

  /* =========================
   * DELETE CONFIG
   * ========================= */
  const deleteHandler = (currentConfigKey: string) => {
    const updatedPlacesConfigs = {
      ...(configsMap.dealsProductsDataPlaces),
    };

    delete updatedPlacesConfigs[currentConfigKey];

    save({
      ...configsMap,
      dealsProductsDataPlaces: updatedPlacesConfigs,
    });
  };

  /* =========================
   * SAVE SINGLE CONFIG
   * ========================= */
  const saveHandler = (key: string, config: PerPrintConfig) => {
    save({
      ...configsMap,
      dealsProductsDataPlaces: {
        ...(configsMap.dealsProductsDataPlaces),
        [key]: config,
      },
    });
  };

  /* =========================
   * RENDER CONFIGS
   * ========================= */
  const renderConfigs = () => {
    const configs = configsMap.dealsProductsDataPlaces || {};

    return Object.entries(configs).map(([key, config]) => (
      <PerPrint
        key={key}
        config={config}
        currentConfigKey={key}
        save={saveHandler}
        delete={deleteHandler}
      />
    ));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
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

      {/* Header component */}
      <div className="p-4">
        <Header />
      </div>

      {/* Action Bar */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium">Places configs</div>
          <Button
            variant="default"
            onClick={add}
            className="flex items-center gap-2"
          >
            New config
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1">
        <div className="w-64 border-r">
          <Sidebar />
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <div id="StageSettingsMenu" className={contentBoxClass}>
            {renderConfigs()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageSettings;
