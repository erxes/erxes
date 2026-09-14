import { ImportExportTypeSelect } from '@/import-export/settings/components/ImportExportTypeSelect';
import { ImportExportViewToggle } from '@/import-export/settings/components/ImportExportViewToggle';
import { ImportExportSettingsPath } from '@/import-export/settings/constants/importExportSettingsPaths';
import { IconFileImport } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const ImportExportSettingsBreadcrumb = () => {
  const { t } = useTranslation('importExport');

  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          <Button variant="ghost" className="font-semibold" asChild>
            <Link to={ImportExportSettingsPath.Import}>
              <IconFileImport className="size-4 text-accent-foreground" />
              {t('import-and-export')}
            </Link>
          </Button>
        </Breadcrumb.Item>

        <Breadcrumb.Separator />

        <ImportExportViewToggle />

        <Breadcrumb.Separator />

        <Breadcrumb.Item>
          <ImportExportTypeSelect />
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
