import { usePropertiesScope } from '@/properties/context/PropertiesScopeContext';
import { ScrollArea } from 'erxes-ui';
import { PropertiesSidebar } from './PropertiesSidebar';

export const PropertiesLayout = ({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) => {
  const { pluginName } = usePropertiesScope();

  return (
    <div className="flex flex-auto overflow-hidden">
      {/* Inside a plugin, its property types are listed in the settings sidebar. */}
      {!pluginName && <PropertiesSidebar />}
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        {header}
        <ScrollArea className="flex-auto">{children}</ScrollArea>
      </div>
    </div>
  );
};
