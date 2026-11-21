import { IconDatabase } from '@tabler/icons-react';
import { PageHeader } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb, type Crumb } from '~/components/AppBreadcrumb';
import { paths } from '~/lib/paths';

/** Settings › Data model › `crumbs`, with the page's actions on the right. */
export const DataModelHeader = ({ crumbs, actions }: { crumbs: Crumb[]; actions?: ReactNode }) => {
  const { t } = useTranslation('data', { keyPrefix: 'model' });

  return (
    <PageHeader>
      <PageHeader.Start>
        <AppBreadcrumb
          items={[
            { label: t('title', 'Data model'), to: paths.settings.dataModel, icon: IconDatabase },
            ...crumbs,
          ]}
        />
      </PageHeader.Start>
      {actions && <PageHeader.End>{actions}</PageHeader.End>}
    </PageHeader>
  );
};
