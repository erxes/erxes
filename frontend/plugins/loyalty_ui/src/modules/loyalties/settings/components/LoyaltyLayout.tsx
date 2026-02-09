import { Filter, Spinner } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { LoyaltyBreadcrumb } from './LoyaltyBreadcrumb';
import { LoyaltySidebar } from './LoyaltySidebar';
import { Suspense } from 'react';
import { LoyaltyTopBar } from './LoyaltyTopBar';

export const LoyaltyLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Filter id="loyalty-settings">
      <div className="flex flex-col flex-auto overflow-hidden">
        <SettingsHeader breadcrumbs={<LoyaltyBreadcrumb />}>
          <div className="flex ml-auto">
            <LoyaltyTopBar />
          </div>
        </SettingsHeader>

        <div className="flex flex-auto overflow-hidden">
          <LoyaltySidebar />
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
  );
};
