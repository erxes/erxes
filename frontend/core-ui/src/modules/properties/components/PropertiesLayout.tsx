import { Outlet } from 'react-router-dom';
import { PropertiesSidebar } from './PropertiesSidebar';
import { ScrollArea } from 'erxes-ui';

export const PropertiesLayout = () => {
  return (
    <div className="flex flex-auto overflow-hidden">
      <PropertiesSidebar />
      <ScrollArea className="flex-auto">
        <Outlet />
      </ScrollArea>
    </div>
  );
};
