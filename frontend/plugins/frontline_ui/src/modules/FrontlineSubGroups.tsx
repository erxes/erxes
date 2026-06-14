import { ChooseChannel } from '@/inbox/channel/components/ChooseChannel';
import { ChooseBrand } from '@/inbox/brand/components/ChooseBrand';
import { CreateBrand } from '@/inbox/brand/components/CreateBrand';
import { ChooseIntegrationTypeContent } from '@/integrations/components/ChooseIntegrationType';
import { CreateChannel } from '@/channels/components/settings/channels-list/CreateChannel';
import { NavigationMenuGroup } from 'erxes-ui';
import { TicketNavigations } from '@/ticket/components/ticket-navigations/TicketNavigations';
import { ReportNavigations } from '@/report/components/report-navigations/ReportNavigations';
import { KnowledgeBaseSubGroup } from '@/knowledgebase/components/KnowledgeBaseTopicsNav';

export const FrontlineSubGroups = () => {
  const pathname = window.location.pathname;
  const isInbox = pathname.startsWith('/frontline/inbox');
  const isTickets = pathname.startsWith('/frontline/tickets');
  const isReport = pathname.startsWith('/frontline/reports');
  const isKnowledgeBase = pathname.startsWith('/frontline/knowledgebase');
  const isForms = pathname.startsWith('/frontline/forms');
  if (isTickets) {
    return <TicketNavigations />;
  }
  if (isKnowledgeBase) {
    return <KnowledgeBaseSubGroup />;
  }
  if (isForms) {
    return (
      <NavigationMenuGroup
        name="Channels"
        actions={<CreateChannel isIconOnly />}
      >
        <ChooseChannel />
      </NavigationMenuGroup>
    );
  }
  if (!isInbox) return null;
  return (
    <>
      <NavigationMenuGroup
        name="Channels"
        actions={<CreateChannel isIconOnly />}
      >
        <ChooseChannel />
      </NavigationMenuGroup>
      <NavigationMenuGroup name="Integration types">
        <ChooseIntegrationTypeContent />
      </NavigationMenuGroup>
      <NavigationMenuGroup name="Brands" actions={<CreateBrand />}>
        <ChooseBrand />
      </NavigationMenuGroup>
    </>
  );
};
