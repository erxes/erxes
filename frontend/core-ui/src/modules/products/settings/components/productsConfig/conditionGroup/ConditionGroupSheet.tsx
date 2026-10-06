import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { ConditionGroupForm } from './ConditionGroupForm';

export const ConditionGroupSheet = () => {
  const { t } = useTranslation('product');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Can action="productsConfigsManage">
        <Sheet.Trigger asChild>
          <Button className="whitespace-nowrap shrink-0">
            <IconPlus />
            {t('add-condition-group', 'Add condition group')}
          </Button>
        </Sheet.Trigger>
      </Can>
      <Sheet.View
        className="p-0 sm:max-w-lg"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {open && <ConditionGroupForm onDone={() => setOpen(false)} />}
      </Sheet.View>
    </Sheet>
  );
};
