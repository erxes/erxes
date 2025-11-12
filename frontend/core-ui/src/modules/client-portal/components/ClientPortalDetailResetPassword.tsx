import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Editor,
  Form,
  Input,
  Label,
  Switch,
  ToggleGroup,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { CLIENTPORTAL_RESET_PASSWORD_SCHEMA } from '../constants/clientPortalEditSchema';

export const ClientPortalDetailResetPassword = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const form = useForm<z.infer<typeof CLIENTPORTAL_RESET_PASSWORD_SCHEMA>>({
    resolver: zodResolver(CLIENTPORTAL_RESET_PASSWORD_SCHEMA),
    defaultValues: {
      type: 'link',
      smsContent: '',
      emailSubject: '',
      emailContent: '',
    },
  });

  function handleSubmit(
    data: z.infer<typeof CLIENTPORTAL_RESET_PASSWORD_SCHEMA>,
  ) {
    // handle save here
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Switch
          id="enableResetPassword"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label variant="peer" htmlFor="enableResetPassword">
          Enable reset password email
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
              name="type"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Type</Form.Label>
                  <ToggleGroup
                    type="single"
                    value={field.value}
                    onValueChange={field.onChange}
                    variant="outline"
                  >
                    <ToggleGroup.Item value="link" className="flex-auto">
                      Link
                    </ToggleGroup.Item>
                    <ToggleGroup.Item value="code" className="flex-auto">
                      Code
                    </ToggleGroup.Item>
                  </ToggleGroup>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="emailSubject"
              render={({ field }) => (
                <Form.Item className="col-start-1">
                  <Form.Label>Email Subject</Form.Label>
                  <Input {...field} />
                  <Form.Description>
                    The subject for the reset password email (optional)
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="emailContent"
              render={({ field }) => (
                <Form.Item className="col-span-2">
                  <Form.Label>Email Content</Form.Label>
                  <Editor
                    initialContent={field.value}
                    onChange={field.onChange}
                  />
                  <Form.Description>
                    Content of the reset password email
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
