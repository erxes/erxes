import { IClientPortal } from '@/client-portal/types/clientPortal';
import { Label, Input, InfoCard, Textarea, Button, Form } from 'erxes-ui';

import { CLIENTPORTAL_EDIT_SCHEMA } from '@/client-portal/constants/clientPortalEditSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const ClientPortalGeneralFields = ({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) => {
  const form = useForm<z.infer<typeof CLIENTPORTAL_EDIT_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_EDIT_SCHEMA),
    defaultValues: {
      name: clientPortal?.name,
      description: clientPortal?.description,
      domain: clientPortal?.domain,
    },
  });

  const onSubmit = (data: z.infer<typeof CLIENTPORTAL_EDIT_SCHEMA>) => {
    console.log(data);
  };
  return (
    <InfoCard title="General">
      <InfoCard.Content>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-3 gap-4"
          >
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item className="space-y-2">
                  <Label>Name</Label>
                  <Input {...field} />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item className="space-y-2">
                  <Label>Description</Label>
                  <Textarea {...field} />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="domain"
              render={({ field }) => (
                <Form.Item className="space-y-2">
                  <Label>Domain</Label>
                  <Input {...field} />
                </Form.Item>
              )}
            />
            <div className="col-start-3 flex justify-end">
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
              >
                Update
              </Button>
            </div>
          </form>
        </Form>
      </InfoCard.Content>
    </InfoCard>
  );
};
