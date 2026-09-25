import { IconExternalLink } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { SettingsLayout } from '~/modules/SettingsLayout';
import { EditMSDynamicConfig } from '../components/settings/EditMSDynamicConfig';
import { MSDynamicConfigTable } from '../components/settings/MSDynamicConfigTable';
import { MSDynamicBreadCrumb } from '../components/settings/MSDynamicBreadcrumb';
import { AddMSDynamicConfig } from '../components/settings/AddMSDynamicConfig';

export const GeneralSettings = () => {
  const { t } = useTranslation('mongolian');
  return (
    <SettingsLayout
      sidebar={false}
      breadcrumbs={<MSDynamicBreadCrumb />}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/mongolian/msdynamic">
              <IconExternalLink />
              {t('go-to-msdynamic')}
            </Link>
          </Button>
          <AddMSDynamicConfig />
        </div>
      }
    >
      <section className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <MSDynamicConfigTable />
      </section>
      <EditMSDynamicConfig />
    </SettingsLayout>
  );
};
