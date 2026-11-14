import type { FieldContentType } from '@erxes/core-contract';
import { ScrollArea } from 'erxes-ui';
import type { ReactNode } from 'react';
import { PropertiesSidebar } from './PropertiesSidebar';

export const PropertiesLayout = ({
  types,
  header,
  children,
}: {
  types: readonly FieldContentType[];
  header: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex flex-auto overflow-hidden">
    <PropertiesSidebar types={types} />
    <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
      {header}
      <ScrollArea className="flex-auto">{children}</ScrollArea>
    </div>
  </div>
);
