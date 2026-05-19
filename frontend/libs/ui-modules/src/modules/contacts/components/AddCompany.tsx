import { FocusSheet, Sheet, Spinner, Button } from 'erxes-ui';
import { lazy, Suspense, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';

const AddCompanyForm = lazy(() =>
  import('./AddCompanyForm').then((module) => ({
    default: module.AddCompanyForm,
  })),
);

export const AddCompany = ({
  children,
  onSuccess,
}: {
  children?: React.ReactNode;
  onSuccess?: (id: string) => void;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <FocusSheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        {children || (
          <Button variant="outline">
            <IconPlus />
            Create new company
          </Button>
        )}
      </Sheet.Trigger>
      <FocusSheet.View className="w-[30%] md:w-[30%] lg:w-[30%]">
        <FocusSheet.Header title="Create company" />
        <FocusSheet.Content className="flex-1 min-h-0">
          <div className="flex overflow-hidden flex-col flex-1">
            <Suspense fallback={<Spinner />}>
              {open && (
                <AddCompanyForm
                  onOpenChange={setOpen}
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
