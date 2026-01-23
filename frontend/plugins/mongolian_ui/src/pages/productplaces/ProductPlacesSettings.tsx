import React, { useState } from 'react';
import SettingsContainer from '../../modules/productplaces/containers/Settings';
import PlaceConfig from '../../modules/productplaces/components/PlaceConfig';
import SplitConfig from '../../modules/productplaces/components/SplitConfig';
import PrintConfig from '../../modules/productplaces/components/PrintConfig';
import DefaultFilterConfig from '../../modules/productplaces/components/DefaultFilterConfig';

type TabKey = 'place' | 'split' | 'print' | 'filter';

const ProductPlacesSettings = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('place');

  const renderContent = () => {
    switch (activeTab) {
      case 'place':
        return (
          <SettingsContainer
            component={PlaceConfig}
            configCode="dealsProductsDataPlaces"
          />
        );

      case 'split':
        return (
          <SettingsContainer
            component={SplitConfig}
            configCode="dealsProductsDataSplit"
          />
        );

      case 'print':
        return (
          <SettingsContainer
            component={PrintConfig}
            configCode="dealsProductsDataPrint"
          />
        );
      case 'filter':
  return (
    <SettingsContainer
      component={DefaultFilterConfig}
      configCode="dealsProductsDefaultFilter"
    />
  );


      default:
      return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* LEFT SIDEBAR */}
      <div className="w-64 border-r bg-gray-50 p-4">
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('place')}
            className={tabClass(activeTab === 'place')}
          >
            Stage in products places config
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={tabClass(activeTab === 'split')}
          >
            Stage in products splits config
          </button>

          <button
            onClick={() => setActiveTab('print')}
            className={tabClass(activeTab === 'print')}
          >
            Stage in products prints config
          </button>

          <button
            onClick={() => setActiveTab('filter')}
            className={tabClass(activeTab === 'filter')}
          >
            Products default filter by Segment
          </button>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};


const tabClass = (active: boolean) =>
  `block w-full rounded px-3 py-2 text-sm text-left transition-colors ${
    active
      ? 'bg-blue-100 text-blue-700 font-medium'
      : 'text-gray-600 hover:bg-gray-100'
  }`;

export default ProductPlacesSettings;
