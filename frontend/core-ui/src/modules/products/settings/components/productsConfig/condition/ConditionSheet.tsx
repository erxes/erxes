import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { ConditionForm } from './ConditionForm';

export const ConditionSheet = () => {
  const { t } = useTranslation('product');
  const [open, setOpen] = useState(false);

  return (
    <CoreModulePanel
      requiredPermission="productsConfigsManage"
      name={'products/settings/productsConfig/condition/ConditionSheet'}
      open={open}
      onOpenChange={setOpen}
      modal
    >
      <Can action="productsConfigsManage">
        <CoreModulePanel.Trigger asChild>
          <Button className="whitespace-nowrap shrink-0">
            <IconPlus />
            {t('add-condition', 'Add condition')}
          </Button>
        </CoreModulePanel.Trigger>
      </Can>
      <CoreModulePanel.View
        className="p-0 sm:max-w-lg"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {open && <ConditionForm onDone={() => setOpen(false)} />}
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
