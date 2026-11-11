import { cn, Separator } from 'erxes-ui';
import { PAGE_HEADER_FIRST_CRUMB_CLASS_NAME } from '../constants/pageHeaderClassNames';

export const SettingsHeader = ({
  children,
  breadcrumbs,
}: {
  children?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col box-border shrink-0 bg-background w-full">
      <div
        className={cn(
          'flex h-10 items-center gap-2 px-3 pl-[calc(0.75rem_+_var(--navigation-panel-toggle-space,0rem)_+_var(--visited-page-tabs-open-button-space,0rem))]',
          PAGE_HEADER_FIRST_CRUMB_CLASS_NAME,
        )}
      >
        <span data-sidebar-panel-slot="" className="contents" />
        {breadcrumbs}
        {children}
      </div>
      <Separator className="w-full" />
    </div>
  );
};
