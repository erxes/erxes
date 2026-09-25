import { Separator } from 'erxes-ui';

export const SettingsHeader = ({
  children,
  breadcrumbs,
}: {
  children?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col h-13 box-border shrink-0 bg-sidebar w-full">
      <div className="flex flex-auto items-center gap-2 px-3 pl-[calc(0.75rem_+_var(--navigation-panel-toggle-space,0rem)_+_var(--visited-page-tabs-open-button-space,0rem))]">
        {breadcrumbs}
        {children}
      </div>
      <Separator className="w-full" />
    </div>
  );
};
