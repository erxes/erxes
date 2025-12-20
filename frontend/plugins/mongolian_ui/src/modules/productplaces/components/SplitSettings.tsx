import React, { useState } from 'react';
import { Button } from 'erxes-ui';

import { 
  IConfigsMap, 
  PerSplitConfig, 
  ProductCategory, 
  Tag, 
  Product, 
  Segment 
} from '../types';
import Header from './Header';
import PerSettings from './PerSettings';
import Sidebar from './Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const SplitSettings = (props: Props) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  // Mock data - replace with actual data fetching
  const [productCategories] = useState<ProductCategory[]>([
    { _id: '1', name: 'Category 1' },
    { _id: '2', name: 'Category 2' },
  ]);

  const [tags] = useState<Tag[]>([
    { _id: '1', name: 'Tag 1', type: 'product' },
    { _id: '2', name: 'Tag 2', type: 'product' },
  ]);

  const [products] = useState<Product[]>([
    { _id: '1', name: 'Product 1' },
    { _id: '2', name: 'Product 2' },
  ]);

  const [segments] = useState<Segment[]>([
    { _id: '1', name: 'Segment 1' },
    { _id: '2', name: 'Segment 2' },
  ]);

  const add = (e: React.MouseEvent) => {
    e.preventDefault();

    const updatedConfigsMap = { ...configsMap };
    
    if (!updatedConfigsMap.dealsProductsDataSplit) {
      updatedConfigsMap.dealsProductsDataSplit = {};
    }

    // must save prev item saved then new item
    const newSplitConfig: PerSplitConfig = {
      title: 'New Places Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      productCategoryIds: [],
      excludeCategoryIds: [],
      excludeProductIds: [],
      segments: [],
    };

    const newConfigsMap = {
      ...updatedConfigsMap,
      dealsProductsDataSplit: {
        ...updatedConfigsMap.dealsProductsDataSplit,
        newSplitConfig,
      },
    };

    setConfigsMap(newConfigsMap);
  };

  const deleteHandler = (currentConfigKey: string) => {
    const updatedConfigsMap = { ...configsMap };
    
    if (updatedConfigsMap.dealsProductsDataSplit) {
      delete updatedConfigsMap.dealsProductsDataSplit[currentConfigKey];
      delete updatedConfigsMap.dealsProductsDataSplit['newSplitConfig'];
    }

    setConfigsMap(updatedConfigsMap);
    props.save(updatedConfigsMap);
  };

  const renderConfigs = () => {
    const configs = configsMap.dealsProductsDataSplit || {};

    return Object.keys(configs).map((key) => {
      const config = configs[key] as PerSplitConfig;
      
      return (
        <PerSettings
          key={key}
          configsMap={configsMap}
          config={config}
          currentConfigKey={key}
          save={props.save}
          delete={deleteHandler}
          productCategories={productCategories}
          tags={tags}
          products={products}
          segments={segments}
        />
      );
    });
  };

  const renderContent = () => {
    return (
      <div 
        id={'SplitSettingsMenu'}
        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
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

      {/* Main Header Component */}
      <div className="p-4">
        <Header />
      </div>

      {/* Action Bar */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium">Split configs</div>
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

export default SplitSettings;