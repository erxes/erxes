import { PropertiesSidebar } from './PropertiesSidebar';

export const PropertiesLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-auto overflow-hidden">
      <PropertiesSidebar />
      <div className="flex-auto overflow-hidden">{children}</div>
    </div>
  );
};
