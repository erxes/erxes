import React from 'react';
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
  const { configsMap, save } = props;

  /* =========================
   * ADD NEW CONFIG
   * ========================= */
  const add = (e: React.MouseEvent) => {
    e.preventDefault();

    const configKey = `config_${Date.now()}`;
    const newPrintConfig: PerPrintConfig = {
      title: 'New Print Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      conditions: [],
    };

    const updatedConfigsMap: IConfigsMap = {
      ...configsMap,
      dealsProductsDataPrint: {
        ...configsMap.dealsProductsDataPrint,
        [configKey]: newPrintConfig,
      },
    };

    save(updatedConfigsMap);
  };

  /* =========================
   * DELETE CONFIG
   * ========================= */
  const deleteHandler = (currentConfigKey: string) => {
    const updatedConfigsMap: IConfigsMap = {
      ...configsMap,
      dealsProductsDataPrint: {
        ...configsMap.dealsProductsDataPrint,
      },
    };

    delete updatedConfigsMap.dealsProductsDataPrint![currentConfigKey];
    save(updatedConfigsMap);
  };

  /* =========================
   * SAVE SINGLE CONFIG
   * ========================= */
  const saveHandler = (key: string, config: PerPrintConfig) => {
    const updatedConfigsMap: IConfigsMap = {
      ...configsMap,
      dealsProductsDataPrint: {
        ...configsMap.dealsProductsDataPrint,
        [key]: config,
      },
    };

    save(updatedConfigsMap);
  };

  /* =========================
   * RENDER CONFIGS
   * ========================= */
  const renderConfigs = () => {
    const configs = configsMap.dealsProductsDataPrint || {};

    return Object.keys(configs).map((key) => (
      <PerPrint
        key={key}
        config={configs[key]}
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

      {/* Main Header */}
      <div className="p-4">
        <Header />
      </div>

      {/* Action Bar */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium">Print configs</div>
          <Button
            variant="default"
            onClick={add}
            className="flex items-center gap-2"
          >
            New config
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1">
        <div className="w-64 border-r">
          <Sidebar />
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <ContentBox id="PrintSettingsMenu">
            {renderConfigs()}
          </ContentBox>
        </div>
      </div>
    </div>
  );
};

export default PrintSettings;
