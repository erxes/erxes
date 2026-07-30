import { Sheet, cn } from 'erxes-ui';

import { ReactNode } from 'react';

export const AccountingSheet = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <Sheet.View className={cn('flex-col p-0 sm:max-w-md', className)}>
      <Sheet.Header className="px-5 shrink-0">
        <Sheet.Title>{title}</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      {children}
    </Sheet.View>
  );
};
