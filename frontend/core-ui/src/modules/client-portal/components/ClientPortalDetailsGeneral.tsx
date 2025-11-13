import { IClientPortal } from '@/client-portal/types/clientPortal';
import { Input, InfoCard, Textarea, Button, Form, Spinner } from 'erxes-ui';

import { CLIENTPORTAL_EDIT_SCHEMA } from '@/client-portal/constants/clientPortalEditSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';

export const ClientPortalGeneral = ({
  clientPortal = {},
}: {
  clientPortal?: IClientPortal;
}) => {
  const form = useForm<z.infer<typeof CLIENTPORTAL_EDIT_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_EDIT_SCHEMA),
    defaultValues: {
      name: clientPortal?.name,
      description: clientPortal?.description,
      domain: clientPortal?.domain,
    },
  });
  const { updateClientPortal, loading } = useUpdateClientPortal();

  const onSubmit = (data: z.infer<typeof CLIENTPORTAL_EDIT_SCHEMA>) => {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          name: data.name,
          description: data.description,
          domain: data.domain,
        },
      },
    });
  };
  return (
    <InfoCard title="General">
      <InfoCard.Content>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-4"
          >
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
            <Form.Field
              control={form.control}
              name="domain"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Domain</Form.Label>
                  <Input {...field} />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item className="col-span-2">
                  <Form.Label>Description</Form.Label>
                  <Textarea {...field} />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <div className="col-start-2 flex justify-end">
              <Button
                type="submit"
                variant="secondary"
                disabled={
                  loading ||
                  form.formState.isSubmitting ||
                  !form.formState.isDirty
                }
              >
                {loading && <Spinner containerClassName="w-auto flex-none" />}
                Update
              </Button>
            </div>
          </form>
        </Form>
      </InfoCard.Content>
    </InfoCard>
  );
};
