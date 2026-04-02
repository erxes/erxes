import { Separator } from 'erxes-ui';

interface OutgoinWebhookLabeledSeparatorProps {
  readonly children: React.ReactNode;
}

export function OutgoinWebhookLabeledSeparator({
  children,
}: Readonly<OutgoinWebhookLabeledSeparatorProps>) {
  return (
    <div className="relative flex items-center">
      <Separator className="flex-1" />
      <span className="px-2 text-sm text-muted-foreground">{children}</span>
      <Separator className="flex-1" />
    </div>
  );
}
