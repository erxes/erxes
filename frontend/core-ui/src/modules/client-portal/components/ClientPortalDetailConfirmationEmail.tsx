import { zodResolver } from '@hookform/resolvers/zod';
import {
  BlockEditor,
  Button,
  Editor,
  Form,
  Input,
  Label,
  Switch,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { CLIENTPORTAL_MAIL_SCHEMA } from '../constants/clientPortalEditSchema';
import { z } from 'zod';
import { useState } from 'react';

export const ClientPortalDetailConfirmationEmail = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const form = useForm<z.infer<typeof CLIENTPORTAL_MAIL_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_MAIL_SCHEMA),
    defaultValues: {
      subject: '',
      invitationContent: '',
      registrationContent: '',
    },
  });

  function handleSubmit(data: z.infer<typeof CLIENTPORTAL_MAIL_SCHEMA>) {
    // handle save here
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Switch
          id="enableConfirmationEmail"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label variant="peer" htmlFor="enableConfirmationEmail">
          Enable confirmation email
        </Label>
      </div>
      {isActive && (
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
                  />
                  <Form.Description>
                    Content for registration confirmation
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button type="submit" className="mt-2 col-span-2">
              Save
            </Button>
          </form>
        </Form>
      )}
    </>
  );
};
