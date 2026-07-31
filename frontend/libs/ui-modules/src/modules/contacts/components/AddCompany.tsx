import { FocusSheet, Sheet, Spinner, Button } from 'erxes-ui';
import { lazy, Suspense, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { ICompany } from '../types';

const AddCompanyForm = lazy(() =>
  import('./AddCompanyForm').then((module) => ({
    default: module.AddCompanyForm,
  })),
);

const stopPropagation = (event: React.SyntheticEvent) => {
  event.stopPropagation();
};

export const AddCompany = ({
  children,
  onSuccess,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode;
  onSuccess?: (id: string, company?: ICompany) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const resolvedOpen = open ?? internalOpen;

  const setOpen = (isOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(isOpen);
    }
    onOpenChange?.(isOpen);
  };

  const defaultTrigger = isControlled ? null : (
    <Button variant="outline">
      <IconPlus />
      Create new company
    </Button>
  );
  const trigger = children ?? defaultTrigger;

  return (
    <FocusSheet open={resolvedOpen} onOpenChange={setOpen}>
      {trigger && <Sheet.Trigger asChild>{trigger}</Sheet.Trigger>}
      <FocusSheet.View
        className="w-[30%] md:w-[30%] lg:w-[30%]"
        onClick={stopPropagation}
        onSubmit={stopPropagation}
      >
        <FocusSheet.Header title="Create company" />
        <FocusSheet.Content className="flex-1 min-h-0">
          <div className="flex overflow-hidden flex-col flex-1">
            <Suspense fallback={<Spinner />}>
              {resolvedOpen && (
                <AddCompanyForm onOpenChange={setOpen} onSuccess={onSuccess} />
              )}
            </Suspense>
          </div>
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};
