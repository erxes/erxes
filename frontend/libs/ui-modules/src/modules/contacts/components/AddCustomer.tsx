import { FocusSheet, Sheet, Spinner, Button, useQueryState } from 'erxes-ui';
import { lazy, Suspense, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SheetNavSidebar } from '../../shared/components/SheetNavSidebar';

const AddCustomerForm = lazy(() =>
  import('./AddCustomerForm').then((module) => ({
    default: module.AddCustomerForm,
  })),
);

export const AddCustomer = ({
  children,
  state,
  onSuccess,
}: {
  children?: React.ReactNode;
  state?: 'lead' | 'customer';
  onSuccess?: (id: string) => void;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const { t: tRoot } = useTranslation('contact');
  const [open, setOpen] = useState<boolean>(false);
  const [, setSelectedTab] = useQueryState<string>('tab');
  const title =
    state === 'lead'
      ? t('title-lead', 'Create Lead')
      : t('title-customer', 'Create Customer');

  const onClose = () => {
    setOpen(false);
    setSelectedTab(null);
  };

  return (
    <FocusSheet
      open={open}
      onOpenChange={(isOpen) => (isOpen ? setOpen(true) : onClose())}
    >
      <Sheet.Trigger asChild>
        {children || (
          <Button variant="outline">
            <IconPlus />
            {t('create-new-customer', 'Create new customer')}
          </Button>
        )}
      </Sheet.Trigger>
      <FocusSheet.View className="w-[50%] md:w-[50%] lg:w-[50%]">
        <FocusSheet.Header title={title} />
        <FocusSheet.Content className="flex-1 min-h-0">
          <FocusSheet.SideBar>
            <SheetNavSidebar
              tabs={['overview', 'properties']}
              groupLabel={tRoot('general', 'General')}
            />
          </FocusSheet.SideBar>
          <div className="flex overflow-hidden flex-col flex-1">
            <Suspense fallback={<Spinner />}>
              {open && (
                <AddCustomerForm
                  onOpenChange={onClose}
                  state={state}
                  onSuccess={onSuccess}
                />
              )}
            </Suspense>
          </div>
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};
