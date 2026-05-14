import { ScrollArea } from 'erxes-ui';

export const PermissionGroupsLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-auto overflow-hidden">
      <ScrollArea className="flex-auto">{children}</ScrollArea>
    </div>
  );
};
