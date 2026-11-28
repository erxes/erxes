import { IconFileImport, IconHierarchy2, IconProgress, IconTag } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppSettingsLayout } from '~/components/AppSettingsLayout';
import { useCan } from '~/modules/auth/session';
import { ImportExportPage } from '~/modules/settings/import-export/ImportExportPage';
import { ImportWizardPage } from '~/modules/settings/import-export/ImportWizardPage';
import { LeadStagesPage } from '~/modules/settings/lead-stages/LeadStagesPage';
import { TagsSettingsPage } from '~/modules/settings/tags/TagsSettingsPage';
import { useTransferTypes } from '~/modules/transfer/useTransfer';
import { paths } from '~/lib/paths';

/** Contacts › Settings; "Exit settings" goes back to the customers. */
const ContactsSettingsLayout = () => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const can = useCan();
  const transfers = useTransferTypes().data ?? [];

  const items = [
    {
      name: t('data-fields', 'Fields'),
      to: paths.settings.dataFieldsOf('core.customer'),
      icon: IconHierarchy2,
    },
    { name: t('tags', 'Tags'), to: paths.contacts.tags, icon: IconTag },
    ...(can('properties.manage')
      ? [
          {
            name: t('lead-stages', 'Lead stages'),
            to: paths.contacts.leadStages,
            icon: IconProgress,
          },
        ]
      : []),
    ...(transfers.length
      ? [
          {
            name: t('import-export', 'Import & export history'),
            to: paths.contacts.importExport,
            icon: IconFileImport,
          },
        ]
      : []),
  ];

  return (
    <AppSettingsLayout
      id="contacts-settings"
      title={t('contacts-settings', 'Contacts settings')}
      exitTo={paths.contacts.customers}
      items={items}
    />
  );
};

/** Everything under `/contacts/settings/*`. */
export const ContactsSettingsRoutes = () => (
  <Routes>
    <Route element={<ContactsSettingsLayout />}>
      <Route index element={<Navigate to={paths.contacts.tags} replace />} />
      <Route path="tags" element={<TagsSettingsPage />} />
      <Route path="lead-stages" element={<LeadStagesPage />} />
      <Route path="import-export" element={<ImportExportPage />} />
      <Route path="import-export/:id" element={<ImportWizardPage />} />
      {/* Absolute: a relative target resolves against the splat and appends to the address. */}
      <Route path="*" element={<Navigate to={paths.contacts.tags} replace />} />
    </Route>
  </Routes>
);
