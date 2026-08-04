import { FocusSheet, Sheet, Spinner, Button, useQueryState } from 'erxes-ui';
import { lazy, Suspense, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { SheetNavSidebar } from '../../shared/components/SheetNavSidebar';

const AddCustomerForm = lazy(() =>
  import('./AddCustomerForm').then((module) => ({
    default: module.AddCustomerForm,
  })),
);

const stopPropagation = (event: React.SyntheticEvent) => {
  event.stopPropagation();
};

export const AddCustomer = ({
  children,
  state,
  onSuccess,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode;
  state?: 'lead' | 'customer';
  onSuccess?: (id: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const resolvedOpen = open ?? internalOpen;
  const [, setSelectedTab] = useQueryState<string>('tab');
  const title = state === 'lead' ? 'Create Lead' : 'Create Customer';

  const setOpen = (isOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(isOpen);
    }
    onOpenChange?.(isOpen);
  };

  const onClose = () => {
    setOpen(false);
    setSelectedTab(null);
  };

  const defaultTrigger = isControlled ? null : (
    <Button variant="outline">
      <IconPlus />
      Create new customer
    </Button>
  );
  const trigger = children ?? defaultTrigger;

  return (
    <FocusSheet
      open={resolvedOpen}
      onOpenChange={(isOpen) => (isOpen ? setOpen(true) : onClose())}
    >
      {trigger && <Sheet.Trigger asChild>{trigger}</Sheet.Trigger>}
      <FocusSheet.View
        className="w-[50%] md:w-[50%] lg:w-[50%]"
        onClick={stopPropagation}
        onSubmit={stopPropagation}
      >
        <FocusSheet.Header title={title} />
        <FocusSheet.Content className="flex-1 min-h-0">
          <FocusSheet.SideBar>
            <SheetNavSidebar
              tabs={['overview', 'properties']}
              groupLabel="General"
            />
          </FocusSheet.SideBar>
          <div className="flex overflow-hidden flex-col flex-1">
            <Suspense fallback={<Spinner />}>
              {resolvedOpen && (
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
