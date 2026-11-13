import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronLeft, IconLoader2 } from '@tabler/icons-react';
import { z } from 'zod';

import { Button, Form, Input, Separator } from 'erxes-ui';
import { useSelectBrandsContext } from '../hooks/useSelectBrandsContext';
import { useBrandsAdd } from '../hooks/useBrandsAdd';
import { IBrand } from '../types/brand';

const formSchema = z.object({
  name: z.string().min(1),
});

export const CreateBrandForm = () => {
  const { newBrandName, onSelect, setNewBrandName } = useSelectBrandsContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: newBrandName,
    },
  });
  const { addBrand, loading } = useBrandsAdd();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addBrand({
      variables: values,
      onCompleted({ brandsAdd }: { brandsAdd: IBrand }) {
        setNewBrandName('');
        onSelect(brandsAdd);
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
      <form
        onSubmit={(event) => {
          // The popover is portaled, but React still bubbles submit to the
          // host form this picker sits in.
          event.stopPropagation();
          form.handleSubmit(onSubmit)(event);
        }}
      >
        <div className="flex flex-col gap-3 p-3 pb-10">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Name</Form.Label>
                <Input {...field} />
                <Form.Message />
              </Form.Item>
            )}
          />
          {form.formState.errors.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
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
