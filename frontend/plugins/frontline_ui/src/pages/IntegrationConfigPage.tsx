import { FacebookConfigUpdateCollapse } from '@/integrations/facebook/components/FacebookConfigUpdate';
import { CallConfigUpdateCollapse } from '@/integrations/call/components/CallConfigUpdate';

export const IntegrationConfigPage = () => {
  return (
    <div className="flex flex-col gap-4 mx-auto max-w-2xl p-8 w-full">
      <FacebookConfigUpdateCollapse />
      <CallConfigUpdateCollapse />
    </div>
  );
};
