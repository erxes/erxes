import { generateSendEmailRecipientMails } from '@/automations/utils/automationBuilderUtils';
import {
  IconCheck,
  IconCircleDashedCheck,
  IconEye,
  IconX,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Card,
  Collapsible,
  Form,
  Input,
  Label,
  Popover,
  Separator,
  Tabs,
  Tooltip,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { MetaFieldLine } from '@/automations/components/builder/nodes/MetaFieldLine';
import {
  IActionProps,
  PlaceHolderInput,
  SelectCustomer,
  SelectMember,
} from 'ui-modules';
import { useSendEmailActionResult } from '../hooks/useSendEmailActionResult';
import {
  useSendEmailCustomMailField,
  useSendEmailSidebarForm,
} from '../hooks/useSendEmailSidebarForm';

const ConfigRow = ({
  title,
  isDone,
  subContent,
  buttonText,
  children,
}: {
  title: string;
  isDone?: boolean;
  subContent?: string;
  buttonText: string;
  children: any;
}) => {
  const [isOpen, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen(!isOpen);
  };

  return (
    <>
      <Collapsible open={isOpen} className="w-full">
        <Collapsible.Trigger className="flex flex-row gap-4 align-between justify-between w-full">
          <div className="flex flex-row align-between">
            <div className="flex flex-col gap-2 items-start">
              <Label className="flex flex-row gap-2 items-center">
                {title}
                {isDone && (
                  <IconCircleDashedCheck className={'text-success w-4 h-4'} />
                )}
              </Label>
              <span className="font-mono text-muted-foreground text-start text-xs">
                {subContent}
              </span>
            </div>
          </div>
          {isOpen ? (
            <Button variant="link" onClick={toggleOpen}>
              <IconX />
            </Button>
          ) : (
            <Button variant="link" onClick={toggleOpen}>
              {`Edit ${buttonText}`}
            </Button>
          )}
        </Collapsible.Trigger>
        <Collapsible.Content>{children}</Collapsible.Content>
        <Separator className="mt-4" />
      </Collapsible>
    </>
  );
};

const CustomMailField = ({
  currentActionIndex,
}: {
  currentActionIndex: number;
}) => {
  const { onChange, removeMail, control, config } =
    useSendEmailCustomMailField(currentActionIndex);

  return (
    <Form.Field
      name={`actions.${currentActionIndex}.config.customMails`}
      control={control}
      render={({ field }) => (
        <Form.Item>
          {(config?.customMails || []).map((customMail: string) => (
            <Badge key={customMail}>
              {customMail}
              <IconX
                className="w-4 h-4 hover:text-accent-foreground hover:cursor-pointer"
                onClick={() => removeMail(customMail)}
              />
            </Badge>
          ))}
          <Input
            onKeyPress={(e) => onChange(e, field.onChange)}
            placeholder="Enter some email"
          />
        </Form.Item>
      )}
    />
  );
};

const SendEmailConfigurationForm = ({
  currentActionIndex,
}: {
  currentActionIndex: number;
}) => {
  const { config, control, contentType } =
    useSendEmailSidebarForm(currentActionIndex);
  return (
    <Card.Content className="flex flex-col gap-4 max-w-xl pt-6">
      <ConfigRow
        title="Sender"
        subContent="Who is sending email"
        buttonText="sender"
        isDone={!!config?.fromUserId}
      >
        <Form.Field
          name={`actions.${currentActionIndex}.config.fromUserId`}
          control={control}
          render={({ field }) => (
            <Form.Item className="py-4">
              <SelectMember.FormItem
                value={field.value}
                onValueChange={field.onChange}
              />
            </Form.Item>
          )}
        />
      </ConfigRow>

      <ConfigRow
        title="Recipient"
        buttonText="select recipients"
        subContent="Who is reciepents"
        isDone={[
          'attributionMails',
          'customMails',
          'customer',
          'teamMember',
        ].some((key) => (config || {})[key])}
      >
        <Tabs defaultValue="general" className="w-full p-4">
          <Tabs.List className="w-full">
            <Tabs.Trigger value="general" className="w-full">
              General
              {config?.attributionMails && (
                <Badge variant="destructive">
                  <IconCheck />
                </Badge>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger value="static" className="relative w-full">
              Static
              {(config?.customMails ||
                config?.customer ||
                config?.teamMember) && <IconCheck className="w-4 h-4" />}
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="general" className="p-4">
            <Form.Field
              name={`actions.${currentActionIndex}.config.attributionMails`}
              control={control}
              render={({ field }) => (
                <Form.Item>
                  <PlaceHolderInput
                    propertyType={contentType || ''}
                    {...field}
                  />
                </Form.Item>
              )}
            />
          </Tabs.Content>
          <Tabs.Content value="static" className="p-4">
            <CustomMailField currentActionIndex={currentActionIndex} />
            <Form.Field
              name={`actions.${currentActionIndex}.config.teamMember`}
              control={control}
              render={({ field }) => (
                <Form.Item className="py-4">
                  <Form.Label>Team members</Form.Label>
                  <SelectMember.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name={`actions.${currentActionIndex}.config.customer`}
              control={control}
              render={({ field }) => (
                <Form.Item className="py-4">
                  <Form.Label>Customers</Form.Label>
                  <SelectCustomer.FormItem
                    mode="multiple"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Form.Item>
              )}
            />
          </Tabs.Content>
        </Tabs>
      </ConfigRow>
      <ConfigRow
        title="Subject"
        subContent="Configure the subject of the email"
        buttonText="Subject"
        isDone={!!config?.subject}
      >
        <Form.Field
          name={`actions.${currentActionIndex}.config.subject`}
          control={control}
          render={({ field }) => (
            <Form.Item className="py-4">
              <PlaceHolderInput propertyType={contentType || ''} {...field} />
            </Form.Item>
          )}
        />
      </ConfigRow>
      <ConfigRow
        title="Selected Email Template"
        buttonText="Change email template"
      >
        template
      </ConfigRow>
    </Card.Content>
  );
};
const AutomationSendEmail = ({ currentActionIndex }: IActionProps) => {
  return <SendEmailConfigurationForm currentActionIndex={currentActionIndex} />;
};

const ReciepentEmails = ({ config }: { config: any }) => {
  const mails = useMemo(
    () => generateSendEmailRecipientMails(config),
    [config],
  );

  return (
    <div>
      {mails.map((mail, index) => (
        <Badge key={index}>{mail}</Badge>
      ))}
    </div>
  );
};

const AutomationSendEmailActionResult = ({ result }: { result: any }) => {
  const { getLabelColor, getLabelText } = useSendEmailActionResult();
  const { fromEmail = '', title, responses } = result;

  return (
    <Popover>
      <Popover.Trigger>
        <Button variant="ghost">
          See <IconEye />
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <MetaFieldLine fieldName="From" content={fromEmail} />

        <MetaFieldLine fieldName="Title" content={title} />

        <MetaFieldLine
          fieldName="To"
          content={
            <>
              {responses.map((response: any, i: number) => (
                <Tooltip key={i}>
                  <Tooltip.Trigger>
                    <Badge variant={getLabelColor(response)}>
                      {response?.toEmail || ''}
                    </Badge>
                  </Tooltip.Trigger>
                  <Tooltip.Content>{getLabelText(response)}</Tooltip.Content>
                </Tooltip>
              ))}
            </>
          }
        />
      </Popover.Content>
    </Popover>
  );
};

const NodeContent = ({ config }: any) => {
  const { fromUserId, subject, templateId } = config || {};

  return (
    <>
      <MetaFieldLine fieldName="From" content={fromUserId} />
      <MetaFieldLine
        fieldName="Reciepents"
        content={
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="ghost">
                See Emails
                <IconEye />
              </Button>
            </Popover.Trigger>
            <Popover.Content>
              <Label>Recipient emails</Label>
              <ReciepentEmails config={config} />
            </Popover.Content>
          </Popover>
        }
      />
      <MetaFieldLine fieldName="Subject" content={subject} />
      <MetaFieldLine fieldName="Template" content={`Under develop`} />
    </>
  );
};

export const SendEmail = {
  SideBarContent: AutomationSendEmail,
  NodeContent,
  ActionResult: AutomationSendEmailActionResult,
};
