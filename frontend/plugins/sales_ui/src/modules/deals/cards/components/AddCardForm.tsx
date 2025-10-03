import { Button, Form, Input, ScrollArea, Sheet } from 'erxes-ui';
import { SalesFormType, salesFormSchema } from '@/deals/constants/formSchema';

import { useDealsAdd } from '../hooks/useDeals';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function AddCardForm({ onCloseSheet }: { onCloseSheet: () => void }) {
  const form = useForm<SalesFormType>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: {
      name: '',
    },
  });
  const { addDeals, loading } = useDealsAdd();

  const onSubmit = (data: SalesFormType) => {
    addDeals({
      variables: {
        ...data,
      },
      onCompleted: () => {
        form.reset();
        onCloseSheet();
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <Sheet.Header className="p-5">
          <Sheet.Title>Add deal</Sheet.Title>
          <Sheet.Description className="sr-only">
            Add a new deal to your stage.
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content>
          <ScrollArea className="flex-auto">
            <div className="p-5">
              <div className="grid grid-cols-2 gap-5 ">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>NAME</Form.Label>
                      <Form.Control>
                        <Input {...field} required />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>
            </div>
          </ScrollArea>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end flex-shrink-0 px-5 gap-1">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={() => onCloseSheet()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
}
