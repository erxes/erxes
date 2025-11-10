import { Button, Dialog } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { EBarimtForm } from './EBarimtForm';
import { ebarimtFormSchema } from '../constants/ebarimtSchema';
import {
  IEBarimt,
  productCategories,
  EBarimtStatus,
} from '../constants/ebarimtDefaultValues';
import { useAddProductRulesOnTax } from '../hooks/useEbarimtAdd';

export const AddProductRulesOnTax = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add Rule
        </Button>
      </Dialog.Trigger>
      <Dialog.ContentCombined
        title="Add Rule"
        description="Add a new rule"
        className="sm:max-w-2xl"
      >
        <AddProductRulesOnTaxForm setOpen={setOpen} />
      </Dialog.ContentCombined>
    </Dialog>
  );
};

export const AddProductRulesOnTaxForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const form = useForm<IEBarimt>({
    resolver: zodResolver(ebarimtFormSchema),
    defaultValues: {
      products: productCategories.PRODUCT,
      status: EBarimtStatus.ACTIVE,
    },
  });
  const { addProductRulesOnTax, loading } = useAddProductRulesOnTax();

  const onSubmit = (data: IEBarimt) => {
    addProductRulesOnTax({
      variables: { ...data },
      onCompleted: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return <EBarimtForm form={form} onSubmit={onSubmit} loading={loading} />;
};
