import { IconEdit } from '@tabler/icons-react';
import { Combobox, Command, Popover, RecordTable, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InvoiceEditForm } from '~/modules/payment/components/InvoiceEditForm';
import { useCanEditInvoice } from '~/modules/payment/components/InvoiceInlineCells';
import { IInvoice } from '~/modules/payment/types/Payment';

export const InvoiceMoreColumnCell = ({ invoice }: { invoice: IInvoice }) => {
  const { t } = useTranslation('payment');
  const canEdit = useCanEditInvoice();
  const [open, setOpen] = useState(false);

  if (!canEdit) {
    return null;
  }

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content className="w-30 min-w-30">
          <Command shouldFilter={false}>
            <Command.List>
              <Command.Item value="edit" onSelect={() => setOpen(true)}>
                <IconEdit className="w-4 h-4" />
                {t('edit')}
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>

      <Sheet open={open} onOpenChange={setOpen} modal>
        <Sheet.View className="p-0 sm:max-w-lg">
          <InvoiceEditForm invoice={invoice} onCancel={() => setOpen(false)} />
        </Sheet.View>
      </Sheet>
    </>
  );
};
