import { Button, Editor, Form, Input, ScrollArea, Sheet } from 'erxes-ui';
import { SalesFormType, salesFormSchema } from '@/deals/constants/formSchema';
import { SelectCompany, SelectCustomer, SelectMember } from 'ui-modules';

import { SelectLabels } from '../../components/common/filters/SelectLabel';
import { useDealsAdd } from '@/deals/cards/hooks/useDeals';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function AddCardForm({ onCloseSheet }: { onCloseSheet: () => void }) {
  const form = useForm<SalesFormType>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: {
      name: '',
      assignedUserIds: [],
      description: '',
      companyIds: [],
      customerIds: [],
      labelIds: [],
      tagIds: [],
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
              <div className="grid grid-cols-1 gap-2">
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
                <Form.Field
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <Form.Item className="mb-5">
                      <Form.Label>Description</Form.Label>

                      <Form.Control>
                        <Editor
                          initialContent={field.value}
                          onChange={field.onChange}
                          scope="sales-add-sheet-description-field"
                        />
                      </Form.Control>
                      <Form.Message className="text-destructive" />
                    </Form.Item>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Form.Field
                  control={form.control}
                  name="assignedUserIds"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Assigned to</Form.Label>
                      <Form.Control>
                        <SelectMember.FormItem
                          mode="multiple"
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="labelIds"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Select label</Form.Label>
                      <Form.Control>
                        <SelectLabels.FormItem
                          mode="multiple"
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="companyIds"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Select companies</Form.Label>
                      <Form.Control>
                        <SelectCompany
                          mode="multiple"
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name={'customerIds'}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Select customers</Form.Label>
                      <SelectCustomer.FormItem
                        mode="multiple"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
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
