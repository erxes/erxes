import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { TBotData } from '@/integrations/facebook/types/FacebookTypes';
import { Button, cn } from 'erxes-ui';

type TBotButtonTemplateData = Extract<TBotData, { type: 'button_template' }>;

export const FbMessengerBotButtonTemplateBlock = ({
  data,
  internal,
}: {
  data: TBotButtonTemplateData;
  internal?: boolean;
}) => {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl bg-background ring-1 ring-border/60',
        internal && 'bg-warning/20 ring-warning/50',
      )}
    >
      <div className="px-3 py-2.5">
        <MessageContent content={data.text} internal={internal} />
      </div>

      {!!data.buttons.length && (
        <div className="border-t bg-muted/20 p-2">
          <div className="flex flex-col gap-2">
            {data.buttons.map((button, index) => (
              <Button
                key={`${button.title}-${index}`}
                type="button"
                variant="outline"
                className="h-8 justify-center text-xs"
                disabled
              >
                {button.title}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
