import React from 'react';
import { Button } from 'erxes-ui';
import { IConfigsMap, PerSplitConfig } from '../types';
import Header from './Header';
import PerSettings from './PerSettings';
import Sidebar from './Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const SplitSettings = (props: Props) => {
  const { configsMap, save } = props;

  /* =========================
   * MOCK DATA (replace later)
   * ========================= */
  const productCategories = [
    { _id: '1', name: 'Category 1' },
    { _id: '2', name: 'Category 2' },
  ];

  const tags = [
    { _id: '1', name: 'Tag 1', type: 'product' },
    { _id: '2', name: 'Tag 2', type: 'product' },
  ];

  const products = [
    { _id: '1', name: 'Product 1' },
    { _id: '2', name: 'Product 2' },
  ];

  const segments = [
    { _id: '1', name: 'Segment 1' },
    { _id: '2', name: 'Segment 2' },
  ];

  /* =========================
   * ADD NEW CONFIG
   * ========================= */
  const add = (e: React.MouseEvent) => {
    e.preventDefault();

    const configKey = `config_${Date.now()}`;

    const newSplitConfig: PerSplitConfig = {
      title: 'New Split Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      productCategoryIds: [],
      excludeCategoryIds: [],
      productTagIds: [],
      excludeTagIds: [],
      excludeProductIds: [],
      segments: [],
    };

    const updatedConfigsMap: IConfigsMap = {
      ...configsMap,
      dealsProductsDataSplit: {
        ...(configsMap.dealsProductsDataSplit || {}),
        [configKey]: newSplitConfig,
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
      dealsProductsDataSplit: {
        ...(configsMap.dealsProductsDataSplit || {}),
      },
    };

    delete updatedConfigsMap.dealsProductsDataSplit![currentConfigKey];

    save(updatedConfigsMap);
  };

  /* =========================
   * UPDATE CONFIG
   * ========================= */
  const updateConfig = (key: string, config: PerSplitConfig) => {
    const updatedConfigsMap: IConfigsMap = {
      ...configsMap,
      dealsProductsDataSplit: {
        ...(configsMap.dealsProductsDataSplit || {}),
        [key]: config,
      },
    };

    save(updatedConfigsMap);
  };

  /* =========================
   * RENDER CONFIGS
   * ========================= */
  const renderConfigs = () => {
    const configs = configsMap.dealsProductsDataSplit || {};

    return Object.keys(configs).map((key) => (
      <PerSettings
        key={key}
        configsMap={configsMap}
        config={configs[key] as PerSplitConfig}
        currentConfigKey={key}
        save={(newConfigsMap) => {
          // Handle the save from PerSettings
          if (newConfigsMap.dealsProductsDataSplit) {
            save({
              ...configsMap,
              dealsProductsDataSplit: {
                ...(configsMap.dealsProductsDataSplit || {}),
                ...newConfigsMap.dealsProductsDataSplit,
              },
            });
          }
        }}
        delete={deleteHandler}
        productCategories={productCategories}
        tags={tags}
        products={products}
        segments={segments}
      />
    ));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Split config</h1>
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <a href="/settings" className="hover:text-gray-700">
                Settings
              </a>
              <span>/</span>
              <span className="text-gray-700">Split config</span>
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
          <div className="text-lg font-medium">Split configs</div>
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
          <div
            id="SplitSettingsMenu"
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4"
          >
            {renderConfigs()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitSettings;
