import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronLeft, IconLoader2 } from '@tabler/icons-react';
import { z } from 'zod';

import { Button, Form, Input, Separator } from 'erxes-ui';
import { useSelectBrandsContext } from '../hooks/useSelectBrandsContext';
import { useBrandsAdd } from '../hooks/useBrandsAdd';

const formSchema = z.object({
  title: z.string().min(1),
  code: z.string().min(1),
  parentId: z.string().optional(),
});

export const CreateBrandForm = () => {
  const { newBrandName, onSelect, setNewBrandName } = useSelectBrandsContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: newBrandName,
      code: '',
      parentId: '',
    },
  });
  const { addBrand, loading } = useBrandsAdd();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addBrand({
      variables: {
        ...values,
      },
      onCompleted({ BrandsAdd }) {
        setNewBrandName('');
        onSelect({
          _id: BrandsAdd._id,
          ...values,
        });
      },
      onError(error) {
        form.setError('root', {
          message: error.message || 'Failed to create brand',
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-3 p-3 pb-10">
          <Form.Field
            control={form.control}
            name="title"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Title</Form.Label>
                <Input {...field} />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="code"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Code</Form.Label>
                <Input {...field} />
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <Separator />
        <div className="p-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <IconLoader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Create'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export function SelectBrandCreateContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setNewBrandName } = useSelectBrandsContext();
  return (
    <div className="overflow-auto">
      <div className="flex items-center font-medium p-1">
        <Button
          variant="ghost"
          onClick={() => {
            setNewBrandName('');
          }}
          className="pl-1 gap-1"
        >
          <IconChevronLeft />
          <h6>Create new brand</h6>
        </Button>
      </div>
      <Separator />
      {children}
    </div>
  );
}
