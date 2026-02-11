import { Separator } from 'erxes-ui';

export function OutgoinWebhookLabeledSeparator({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      <Separator className="flex-1" />
      <span className="px-2 text-sm text-muted-foreground">{children}</span>
      <Separator className="flex-1" />
    </div>
  );
}
