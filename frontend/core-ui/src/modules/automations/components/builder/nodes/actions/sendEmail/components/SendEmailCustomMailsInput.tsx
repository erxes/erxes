import { useSendEmailCustomMailField } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailSidebarForm';
import { IconX } from '@tabler/icons-react';
import { Badge, Form, Input } from 'erxes-ui';

export const SendEmailCustomMailsInput = ({
  currentActionIndex,
}: {
  currentActionIndex: number;
}) => {
  const { onChange, removeMail, control } =
    useSendEmailCustomMailField(currentActionIndex);

  return (
    <Form.Field
      name={`actions.${currentActionIndex}.config.customMails`}
      control={control}
      render={({ field }) => (
        <Form.Item className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(field.value || []).map((customMail: string) => (
              <Badge key={customMail} variant="secondary" className="pr-1">
                {customMail}
                <IconX
                  className="w-3 h-3 ml-1 hover:text-destructive cursor-pointer"
                  onClick={() => removeMail(customMail)}
                />
              </Badge>
            ))}
          </div>
          <Input
            onKeyPress={(e) => onChange(e, field.onChange)}
            placeholder="Enter email address"
            className="w-full"
          />
        </Form.Item>
      )}
    />
  );
};
