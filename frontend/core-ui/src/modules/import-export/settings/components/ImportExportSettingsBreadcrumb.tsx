import { IconFileImport } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ImportExportSettingsBreadcrumb = () => {
  const { t } = useTranslation('import-export');
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconFileImport className="w-4 h-4 text-accent-foreground" />
        {t('import-and-export', 'Import & Export')}
      </Button>
      <Separator.Inline />
    </>
  );
};
