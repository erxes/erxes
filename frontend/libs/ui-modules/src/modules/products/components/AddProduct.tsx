import { Button, Sheet, Spinner } from 'erxes-ui';
import { Suspense, useState, lazy } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { MutationHookOptions } from '@apollo/client';

const AddProductForm = lazy(() =>
  import('./AddProductForm').then((module) => ({
    default: module.AddProductForm,
  })),
);

export const AddProduct = ({
  children,
  options,
}: {
  children?: React.ReactNode;
  options?: MutationHookOptions<{ productsAdd: { _id: string } }>;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        {children || (
          <Button variant="outline">
            <IconPlus />
            Create new product
          </Button>
        )}
      </Sheet.Trigger>
      <Sheet.View className="p-0">
        <Suspense fallback={<Spinner />}>
          {open && <AddProductForm onOpenChange={setOpen} options={options} />}
        </Suspense>
      </Sheet.View>
    </Sheet>
  );
};
