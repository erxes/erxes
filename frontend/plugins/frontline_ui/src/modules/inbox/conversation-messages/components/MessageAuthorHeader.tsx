import { IconSparkles } from '@tabler/icons-react';
import { CustomersInline } from 'ui-modules';

export const MessageAuthorHeader = ({
  customerId,
  showBotName,
}: {
  customerId?: string;
  showBotName: boolean;
}) => (
  <>
    {customerId && (
      <div className="pl-11 pt-4 pb-0.5 text-xs font-medium text-muted-foreground">
        <CustomersInline customerIds={[customerId]} hideAvatar />
      </div>
    )}
    {showBotName && (
      <div className="pl-11 pt-4 pb-0.5 flex items-center gap-1 text-xs font-medium text-primary">
        <IconSparkles className="size-3.5" /> AI Agent
      </div>
    )}
  </>
);
