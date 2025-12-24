import { PropertiesSidebar } from './PropertiesSidebar';
import { ScrollArea } from 'erxes-ui';

export const PropertiesLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-auto overflow-hidden">
      <PropertiesSidebar />
      <ScrollArea className="flex-auto">{children}</ScrollArea>
    </div>
  );
};
