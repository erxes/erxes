import { AutomationFolderFormDialog } from '@/automations/components/list/folders/AutomationFolderFormDialog';
import { IconFolderPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';

export const AutomationFolderCreateButton = () => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);

  return (
    <Can action="automationsUpdate">
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <IconFolderPlus />
          {t('folder-new')}
        </Button>
        <AutomationFolderFormDialog open={open} onOpenChange={setOpen} />
      </>
    </Can>
  );
};
