import { Separator, Sidebar } from 'erxes-ui';

export const SettingsHeader = ({
  children,
  breadcrumbs,
}: {
  children?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col h-13 box-border shrink-0 bg-sidebar w-full">
      <div className="flex gap-2 px-3 flex-auto items-center">
        <Sidebar.Trigger />
        <Separator.Inline />
        {breadcrumbs}
        {children}
      </div>
      <Separator className="w-full" />
    </div>
  );
};
