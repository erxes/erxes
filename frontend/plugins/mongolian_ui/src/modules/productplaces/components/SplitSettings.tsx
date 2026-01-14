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

const SplitSettings = ({ configsMap, save }: Props) => {
  /* =========================
   * MOCK DATA (replace later)
   * ========================= */
  type Item = { _id: string; name: string };
  const productCategories: Item[] = [
    { _id: '1', name: 'Category 1' },
    { _id: '2', name: 'Category 2' },
  ];
  const tags: Item[] = [
    { _id: '1', name: 'Tag 1' },
    { _id: '2', name: 'Tag 2' },
  ];
  const products: Item[] = [
    { _id: '1', name: 'Product 1' },
    { _id: '2', name: 'Product 2' },
  ];
  const segments: Item[] = [
    { _id: '1', name: 'Segment 1' },
    { _id: '2', name: 'Segment 2' },
  ];

  const configs = configsMap.dealsProductsDataSplit ?? {};

  /* =========================
   * ADD NEW CONFIG
   * ========================= */
  const addConfig = (e: React.MouseEvent) => {
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

    save({
      ...configsMap,
      dealsProductsDataSplit: {
        ...configs,
        [configKey]: newSplitConfig,
      },
    });
  };

  /* =========================
   * DELETE CONFIG
   * ========================= */
  const deleteConfig = (configKey: string) => {
    const updatedConfigs = { ...configs };
    delete updatedConfigs[configKey];
    save({ ...configsMap, dealsProductsDataSplit: updatedConfigs });
  };

  /* =========================
   * UPDATE CONFIG
   * ========================= */
  const updateConfig = (configKey: string, updatedConfig: PerSplitConfig) => {
    save({
      ...configsMap,
      dealsProductsDataSplit: {
        ...configs,
        [configKey]: updatedConfig,
      },
    });
  };

  /* =========================
   * RENDER CONFIGS
   * ========================= */
  const renderConfigs = () =>
    Object.keys(configs).map((key) => (
      <PerSettings
        key={key}
        config={configs[key]}
        currentConfigKey={key}
        save={(updatedConfig) => updateConfig(key, updatedConfig)}
        delete={deleteConfig}
        productCategories={productCategories}
        tags={tags}
        products={products}
        segments={segments}
      />
    ));

  const isEmpty = Object.keys(configs).length === 0;

  /* =========================
   * RENDER COMPONENT
   * ========================= */
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
            onClick={addConfig}
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

            {isEmpty && (
              <div className="text-sm text-gray-400 text-center py-10">
                No split configs yet. Click "New config" to add one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitSettings;