import { IntegrationList } from '@/integrations/components/IntegrationList';
import { ScrollArea } from 'erxes-ui';

export const IntegrationSettingsPage = () => {
  return (
    <ScrollArea>
      <div className="h-full w-full mx-auto max-w-3xl px-8 py-5 flex flex-col gap-8">
        <div className="flex flex-col gap-2 px-1">
          <h1 className="text-lg font-semibold">Integrations</h1>
          <span className="font-normal text-muted-foreground text-sm">
            Set up your integrations and start connecting with your customers
          </span>
        </div>
        <IntegrationList />
      </div>
    </ScrollArea>
  );
};
