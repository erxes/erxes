import { FacebookConfigUpdateCollapse } from '@/integrations/facebook/components/FacebookConfigUpdate';
import { CallConfigUpdateCollapse } from '@/integrations/call/components/CallConfigUpdate';
import { InstagramConfigUpdateCollapse } from '@/integrations/instagram/components/InstagramConfigUpdate';
import { useAtomValue } from 'jotai';
import { currentOrganizationState } from 'ui-modules';
import { MessageProConfigUpdateCollapse } from '@/integrations/message-pro/components/MessageProConfigUpdate';

export const IntegrationConfigPage = () => {
  const org = useAtomValue(currentOrganizationState);
  const isSaas = org?.type === 'saas';
  return (
    <div className="flex flex-col gap-4 mx-auto max-w-2xl p-8 w-full">
      {!isSaas && <FacebookConfigUpdateCollapse />}
      {!isSaas && <InstagramConfigUpdateCollapse />}
      <CallConfigUpdateCollapse />
      <MessageProConfigUpdateCollapse />
    </div>
  );
};
