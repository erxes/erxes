import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Editor, Form, Input, Select, Spinner } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_MAIL_SCHEMA } from '../constants/clientPortalEditSchema';
import { z } from 'zod';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';
import { useState } from 'react';

export const ClientPortalDetailUserVerification = ({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) => {
  const [verificationType, setVerificationType] = useState<
    'email' | 'phone' | 'both' | 'none'
  >(clientPortal.verificationType || 'email');

  const form = useForm<z.infer<typeof CLIENTPORTAL_MAIL_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_MAIL_SCHEMA),
    defaultValues: clientPortal?.verificationMailConfig,
  });
  const { updateClientPortal, loading } = useUpdateClientPortal();

  function handleSubmit(data: z.infer<typeof CLIENTPORTAL_MAIL_SCHEMA>) {
    // handle save here
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: { verificationMailConfig: data },
      },
    });
  }

  const handleVerificationTypeChange = (
    value: 'email' | 'phone' | 'both' | 'none',
  ) => {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: { verificationType: value },
      },
    });

    setVerificationType(value);
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Select
          value={verificationType}
          onValueChange={handleVerificationTypeChange}
        >
          <Select.Trigger>
            <Select.Value placeholder="Select verification type" />{' '}
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="email">Email</Select.Item>
            <Select.Item value="phone">Phone</Select.Item>
            <Select.Item value="both">Both</Select.Item>
            <Select.Item value="none">None</Select.Item>
          </Select.Content>
        </Select>
      </div>
      {(verificationType === 'email' || verificationType === 'both') && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <Form.Field
              control={form.control}
              name="subject"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Subject</Form.Label>
                  <Input {...field} />
                  <Form.Description>
                    The subject line for the confirmation email
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="invitationContent"
              render={({ field }) => (
                <Form.Item className="col-span-2">
                  <Form.Label>Invitation Content</Form.Label>
                  <Editor
                    initialContent={field.value}
                    onChange={field.onChange}
                    isHTML
                  />
                  <Form.Description>
                    Content for invitation email
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="registrationContent"
              render={({ field }) => (
                <Form.Item className="col-span-2">
                  <Form.Label>Registration Content</Form.Label>
                  <Editor
                    initialContent={field.value}
                    onChange={field.onChange}
                    isHTML
                  />
                  <Form.Description>
                    Content for registration confirmation
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button
              type="submit"
              className="mt-2 col-span-2"
              disabled={loading}
              variant="secondary"
            >
              {loading && (
                <Spinner containerClassName="w-auto flex-none mr-2" />
              )}
              Save
            </Button>
          </form>
        </Form>
      )}
    </>
  );
};
