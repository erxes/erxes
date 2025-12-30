// frontend/plugins/mongolian_ui/src/pages/productplaces/ProductPlacesSettings.tsx
import React, { useState } from 'react';
import SettingsContainer from '../../modules/productplaces/containers/Settings';
import SettingsStage from '../../modules/productplaces/components/SettingsStage';
import SettingsPrint from '../../modules/productplaces/components/SettingsPrint';
import SettingsSplit from '../../modules/productplaces/components/SettingsSplit';
import SettingsFilter from '../../modules/productplaces/components/SettingsFilter';

const ProductPlacesSettings = () => {
  const [activeTab, setActiveTab] = useState<'stage' | 'split' | 'print' | 'filter'>('stage');

  const renderContent = () => {
    switch (activeTab) {
      case 'stage':
        return (
          <SettingsContainer
            component={SettingsStage}
            configCode="dealsProductsDataPlaces"
          />
        );
      case 'split':
        return (
          <SettingsContainer
            component={SettingsSplit}
            configCode="dealsProductsDataSplit"
          />
        );
      case 'print':
        return (
          <SettingsContainer
            component={SettingsPrint}
            configCode="dealsProductsDataPrint"
          />
        );
      case 'filter':
        return (
          <SettingsContainer
            component={SettingsFilter}
            configCode="dealsProductsDefaultFilter"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* LEFT SIDEBAR - STATE-BASED NAVIGATION */}
      <div className="w-64 border-r bg-gray-50 p-4">
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('stage')}
            className={`block w-full rounded px-3 py-2 text-sm text-left transition-colors ${
              activeTab === 'stage'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Stage in products places config
          </button>
          
          <button
            onClick={() => setActiveTab('split')}
            className={`block w-full rounded px-3 py-2 text-sm text-left transition-colors ${
              activeTab === 'split'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Stage in products splits config
          </button>
          
          <button
            onClick={() => setActiveTab('print')}
            className={`block w-full rounded px-3 py-2 text-sm text-left transition-colors ${
              activeTab === 'print'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Stage in products prints config
          </button>
          
          <button
            onClick={() => setActiveTab('filter')}
            className={`block w-full rounded px-3 py-2 text-sm text-left transition-colors ${
              activeTab === 'filter'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
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

export default ProductPlacesSettings;