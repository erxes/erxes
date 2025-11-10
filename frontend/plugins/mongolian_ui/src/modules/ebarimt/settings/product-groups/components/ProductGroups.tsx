import { Button, Dialog } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import {
  IProductGroup,
  ProductCategory,
} from '../constants/productGroupsDefaultValues';
import { productGroupsSchema } from '../constants/productGroupsSchema';
import { useAddProductGroup } from '../hooks/useProductGroup';
import { ProductGroupsForm } from './ProductGroupsForm';

export const AddProductGroups = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add Group
        </Button>
      </Dialog.Trigger>
      <Dialog.ContentCombined
        title="Add Group"
        description="Add a new group"
        className="sm:max-w-2xl"
      >
        <AddProductGroupsForm setOpen={setOpen} />
      </Dialog.ContentCombined>
    </Dialog>
  );
};

export const AddProductGroupsForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const form = useForm<IProductGroup>({
    resolver: zodResolver(productGroupsSchema),
    defaultValues: {
      mainProducts: ProductCategory.PRODUCT,
      subProducts: ProductCategory.PRODUCT,
    },
  });
  const { addProductGroup, loading } = useAddProductGroup();

  const onSubmit = (data: IProductGroup) => {
    addProductGroup({
      variables: { ...data },
      onCompleted: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <ProductGroupsForm form={form} onSubmit={onSubmit} loading={loading} />
  );
};
