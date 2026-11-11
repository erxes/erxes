import { ScrollArea } from 'erxes-ui';
import type { ReactNode } from 'react';
import { PropertiesSidebar } from './PropertiesSidebar';

export const PropertiesLayout = ({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex flex-auto overflow-hidden">
    <PropertiesSidebar />
    <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
      {header}
      <ScrollArea className="flex-auto">{children}</ScrollArea>
    </div>
  </div>
);
