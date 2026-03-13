import { Button, FocusSheet, Sheet, Spinner } from 'erxes-ui';
import { Suspense, useState, lazy } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { MutationHookOptions } from '@apollo/client';
import { useTranslation } from 'react-i18next';

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
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const { t } = useTranslation('product', { keyPrefix: 'add' });

  return (
    <FocusSheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        {children || (
          <Button variant="outline">
            <IconPlus />
            Create new product
          </Button>
        )}
      </Sheet.Trigger>
      <FocusSheet.View
        className={
          showMoreInfo
            ? 'w-[70%] md:w-[70%] lg:w-[70%]'
            : 'w-[30%] md:w-[30%] lg:w-[30%]'
        }
      >
        <FocusSheet.Header title={t('create-product') || 'Create product'} />
        <FocusSheet.Content className="flex-1 min-h-0">
          <div className="flex overflow-hidden flex-col flex-1">
            <Suspense fallback={<Spinner />}>
              {open && (
                <AddProductForm
                  embed
                  onOpenChange={setOpen}
                  showMoreInfo={showMoreInfo}
                  onShowMoreInfoChange={setShowMoreInfo}
                  options={options}
                />
              )}
            </Suspense>
          </div>
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};
