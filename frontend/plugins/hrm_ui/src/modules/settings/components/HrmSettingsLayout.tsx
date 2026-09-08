import { HrmSettingsSidebar } from './HrmSettingsSidebar';

export const HrmSettingsLayout = ({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
}) => (
  <div className="flex h-full overflow-hidden">
    <HrmSettingsSidebar />
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      {actions && (
        <div className="flex h-12 shrink-0 items-center justify-end border-b px-4">
          {actions}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  </div>
);
