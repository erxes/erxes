import { IconExternalLink } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { Button } from 'erxes-ui';

import { SettingsLayout } from '~/modules/SettingsLayout';
import { EditMSDynamicConfig } from '../components/settings/EditMSDynamicConfig';
import { MSDynamicConfigTable } from '../components/settings/MSDynamicConfigTable';
import { MSDynamicBreadCrumb } from '../components/settings/MSDynamicBreadcrumb';
import { AddMSDynamicConfig } from '../components/settings/AddMSDynamicConfig';

export const GeneralSettings = () => {
  return (
    <SettingsLayout
      sidebar={false}
      breadcrumbs={<MSDynamicBreadCrumb />}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/mongolian/msdynamic">
              <IconExternalLink />
              Go to MCDynamic
            </Link>
          </Button>
          <AddMSDynamicConfig />
        </div>
      }
    >
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <MSDynamicConfigTable />
        </div>
      </section>
      <EditMSDynamicConfig />
    </SettingsLayout>
  );
};
