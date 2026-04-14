import { IconFileImport } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';

export const ImportExportSettingsBreadcrumb = () => {
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconFileImport className="w-4 h-4 text-accent-foreground" />
        Import & Export
      </Button>
      <Separator.Inline />
    </>
  );
};
