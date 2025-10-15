import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Sheet, Form, Input, Checkbox, Spinner } from 'erxes-ui';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { CALL_INTEGRATION_FORM_SCHEMA } from '@/integrations/call/constants/callIntegrationAddSchema';
import { z } from 'zod';
import { SelectMember } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { callEditSheetAtom } from '@/integrations/call/states/callEditSheetAtom';

export const CallIntegrationForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>>;
  onSubmit: (data: z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>) => void;
  loading?: boolean;
}) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'operators',
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-auto overflow-hidden"
      >
        <CallIntegrationFormLayout
          actions={
            <Button
              type="submit"
              onClick={() => form.handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading && <Spinner size="sm" />}
              Save
            </Button>
          }
        >
          <Form.Field
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Name</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="phone"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Phone Number</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="websocketServer"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>WebSocket Server</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="queues"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Queues</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            name="srcTrunk"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Source Trunk</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="dstTrunk"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Destination Trunk</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <div className="font-medium">Operators</div>
          {fields.map((field, index) => (
            <div
              className="col-span-2 border-b last-of-type:border-b-0 border-dashed pb-4 last-of-type:pb-0"
              key={field.id}
            >
              <div className="flex gap-4 w-full">
                <Form.Field
                  name={`operators.${index}.userId`}
                  render={({ field }) => (
                    <Form.Item className="flex-auto w-1/3">
                      <Form.Label>Operator</Form.Label>
                      <SelectMember.FormItem
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name={`operators.${index}.gsUsername`}
                  render={({ field }) => (
                    <Form.Item className="flex-auto">
                      <Form.Label>Username</Form.Label>
                      <Form.Control>
                        <Input {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name={`operators.${index}.gsPassword`}
                  render={({ field }) => (
                    <Form.Item className="flex-auto">
                      <Form.Label>Password</Form.Label>
                      <Form.Control>
                        <Input {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-destructive/20 text-destructive mt-6 size-8 hover:bg-destructive/30"
                  onClick={() => remove(index)}
                >
                  <IconTrash />
                </Button>
              </div>
            </div>
          ))}
          <Button
            className="col-span-2"
            variant="secondary"
            onClick={() =>
              append({
                userId: undefined,
                gsUsername: '',
                gsPassword: '',
              })
            }
          >
            <IconPlus />
            Add Operator
          </Button>
        </CallIntegrationFormLayout>
      </form>
    </Form>
  );
};

export const CallIntegrationFormLayout = ({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions: React.ReactNode;
}) => {
  const callEditSheet = useAtomValue(callEditSheetAtom);
  return (
    <>
      <Sheet.Header>
        <Sheet.Title>{callEditSheet ? 'Edit Call' : 'Add Call'}</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="overflow-auto p-4 styled-scroll">
        <div className="grid grid-cols-2 gap-4">{children}</div>
      </Sheet.Content>
      <Sheet.Footer>
        <Sheet.Close asChild>
          <Button className="mr-auto text-muted-foreground" variant="ghost">
            Cancel
          </Button>
        </Sheet.Close>
        {actions}
      </Sheet.Footer>
    </>
  );
};
