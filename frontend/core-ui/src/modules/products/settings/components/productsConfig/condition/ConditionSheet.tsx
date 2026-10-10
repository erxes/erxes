import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { ConditionForm } from './ConditionForm';

export const ConditionSheet = () => {
  const { t } = useTranslation('product');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Can action="productsConfigsManage">
        <Sheet.Trigger asChild>
          <Button className="whitespace-nowrap shrink-0">
            <IconPlus />
            {t('add-condition', 'Add condition')}
          </Button>
        </Sheet.Trigger>
      </Can>
      <Sheet.View
        className="p-0 sm:max-w-lg"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {open && <ConditionForm onDone={() => setOpen(false)} />}
      </Sheet.View>
    </Sheet>
  );
};
