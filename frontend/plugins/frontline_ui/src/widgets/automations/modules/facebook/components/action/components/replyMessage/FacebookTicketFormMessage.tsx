import { Form, Input } from 'erxes-ui';
import { FacebookMessageProps } from '~/widgets/automations/modules/facebook/components/action/types/messageActionForm';
import { useReplyMessageAction } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';

export const FacebookTicketFormMessage = ({
  index,
}: FacebookMessageProps<{ type: 'ticketForm' }>) => {
  const { control } = useReplyMessageAction();

  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={control}
        name={`messages.${index}.text`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Prompt text</Form.Label>
            <Form.Control>
              <Input placeholder="Please fill in the ticket details:" {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <div className="rounded-md border border-dashed border-muted-foreground/40 px-3 py-2 flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground font-medium">Collected fields (fixed)</p>
        <div className="flex flex-col gap-1">
          <div className="text-xs text-foreground/70 bg-muted rounded px-2 py-1">Ticket name <span className="text-destructive">*</span></div>
          <div className="text-xs text-foreground/70 bg-muted rounded px-2 py-1">Description</div>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
          Output variables: <code>trigger.ticket:name</code>, <code>trigger.ticket:description</code>
        </p>
      </div>
    </div>
  );
};
