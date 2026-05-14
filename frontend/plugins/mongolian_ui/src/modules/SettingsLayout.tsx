import { Filter, Spinner, Sidebar } from 'erxes-ui';
import { Suspense } from 'react';
import { SettingsHeader } from 'ui-modules';

export const SettingsLayout = ({
  sidebar,
  breadcrumbs,
  actions,
  children,
}: {
  sidebar: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Sidebar.Provider>
      <Filter id="mongolian-settings">
        <div className="flex flex-col flex-auto overflow-hidden">
          <SettingsHeader breadcrumbs={breadcrumbs}>
            {actions && <div className="ml-auto">{actions}</div>}
          </SettingsHeader>
          <div className="flex flex-auto overflow-hidden">
            {sidebar}
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-full w-full">
                  <Spinner />
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </div>
      </Filter>
    </Sidebar.Provider>
  );
};
