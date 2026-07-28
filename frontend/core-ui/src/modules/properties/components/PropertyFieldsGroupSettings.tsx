import { PropertyGroupEditSheet } from './PropertyGroupEdit';
import { PropertiesFilterBar } from './record/PropertiesFilterBar';
import { PropertiesTable } from './record/PropertiesTable';

export const PropertyFieldsGroupSettings = () => {
  return (
    <div className="size-full overflow-hidden flex flex-col">
      <PropertyGroupEditSheet />
      <PropertiesFilterBar />
      <PropertiesTable />
    </div>
  );
};
