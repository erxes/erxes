import { PropertiesHeader } from '@/settings/properties/components/PropertiesHeader';
import { PropertiesSidebar } from '@/settings/properties/components/PropertiesSidebar';
import { PropertyFieldsGroupSettings } from '@/settings/properties/components/PropertyFieldsGroupSettings';
import React from 'react';

export const PropertiesSettings = () => {
  return (
    <>
      <PropertiesHeader />
      <div className="flex flex-auto overflow-hidden">
        <PropertiesSidebar />
        <div className="flex flex-col h-full overflow-hidden flex-1">
          {/* You can add a sub-header component here if needed */}
          <PropertyFieldsGroupSettings />
        </div>
      </div>
    </>
  );
};
