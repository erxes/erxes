import { AutomationActionNodeConfigProps } from 'ui-modules';

type TInboxMessageActionForm = { text?: string };

export const InboxMessageActionConfig = ({
  config,
}: AutomationActionNodeConfigProps<TInboxMessageActionForm>) => {
  const text = config?.text;

  if (!text) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No message configured
      </p>
    );
  }

  return <p className="line-clamp-3 text-xs text-foreground">{text}</p>;
};
