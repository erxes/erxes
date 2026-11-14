import { ProductEditorPanel } from '@/products/components/ProductEditorPanel';
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
    <>
      <Can action="productsConfigsManage">
        <Button
          onClick={() => setOpen(true)}
          className="whitespace-nowrap shrink-0"
        >
          <IconPlus />
          {t('add-condition', 'Add condition')}
        </Button>
      </Can>
      <ProductEditorPanel
        name="conditions/new"
        open={open}
        onOpenChange={setOpen}
        requiredPermission="productsConfigsManage"
      >
        {open && <ConditionForm onDone={() => setOpen(false)} />}
      </ProductEditorPanel>
    </>
  );
};
