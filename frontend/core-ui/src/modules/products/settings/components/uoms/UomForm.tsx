import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Sheet, Form, Input } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUomsEdit } from '../../hooks/useUomsEdit';
import { useUomsAdd } from '../../hooks/useUomsAdd';
import { useToast } from 'erxes-ui';

const uomFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
});

interface IUomFormProps {
  uom?: any;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const UomForm = ({
  uom,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: IUomFormProps) => {
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;

  const handleOpenChange = (val: boolean) => {
    setInternalOpen(val);
    onOpenChange?.(val);
    if (!val) form.reset();
  };

  const { uomsAdd, loading: loadingAdd } = useUomsAdd();
  const { uomsEdit, loading: loadingEdit } = useUomsEdit();

  const form = useForm<{ name: string; code: string }>({
    defaultValues: uom
      ? { name: uom.name, code: uom.code }
      : { name: '', code: '' },
    resolver: zodResolver(uomFormSchema),
  });

  const onSubmit = (data: { name: string; code: string }) => {
    if (uom) {
      uomsEdit({
        variables: { id: uom._id, ...data },
        onCompleted: () => {
          toast({
            title: 'Success',
            description: 'Uom updated successfully',
            variant: 'default',
          });
          handleOpenChange(false);
        },
      });
    } else {
      uomsAdd({
        variables: { ...data },
        onCompleted: () => {
          handleOpenChange(false);
          form.reset();
        },
        onError: (e) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <Sheet.Trigger asChild>{trigger}</Sheet.Trigger>}
      <Sheet.View
        className="sm:max-w-lg p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <Sheet.Content>
              <Sheet.Header className="p-5">
                <Sheet.Title>{uom ? 'Edit Uom' : 'Add Uom'}</Sheet.Title>
                <Sheet.Description className="sr-only"></Sheet.Description>
                <Sheet.Close />
              </Sheet.Header>
              <div className="flex justify-center gap-2 w-full p-4">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Form.Item className="w-full">
                      <Form.Label>Name</Form.Label>
                      <Form.Control>
                        <Input placeholder="Name" {...field} autoFocus />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                ></Form.Field>
                <Form.Field
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <Form.Item className="w-full">
                      <Form.Label>Code</Form.Label>
                      <Form.Control>
                        <Input
                          placeholder="Code"
                          {...field}
                          className="w-full"
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                ></Form.Field>
              </div>
            </Sheet.Content>
            <Sheet.Footer className="flex justify-end shrink-0 gap-1 px-5">
              <Button
                type="button"
                variant="ghost"
                className="bg-background hover:bg-background/90"
                onClick={() => {
                  handleOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loadingAdd || loadingEdit}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loadingAdd || loadingEdit ? 'Saving...' : 'Save'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
