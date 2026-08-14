import { ChooseChannel } from '@/inbox/channel/components/ChooseChannel';
import { ChooseBrand } from '@/inbox/brand/components/ChooseBrand';
import { CreateBrand } from '@/inbox/brand/components/CreateBrand';
import { CreateChannel } from '@/channels/components/settings/channels-list/CreateChannel';
import { NavigationMenuGroup } from 'erxes-ui';
import { TicketNavigations } from '@/ticket/components/ticket-navigations/TicketNavigations';
import { KnowledgeBaseSubGroup } from '@/knowledgebase/components/KnowledgeBaseTopicsNav';
import { DiscordServersNav } from '@/integrations/discord/components/DiscordChannelsNav';
import { PersonalInboxNav } from '@/inbox/channel/components/PersonalInboxNav';
import { TeamChannelsNav } from '@/inbox/channel/components/TeamChannelsNav';
import { InboxWorkNav } from '@/inbox/components/InboxWorkNav';
import { NavigationGroupActions } from '@/NavigationGroupActions';
import { useLocation } from 'react-router-dom';

export const FrontlineSubGroups = () => {
  const { pathname } = useLocation();
  const isInbox = pathname.startsWith('/frontline/inbox');
  const isTickets = pathname.startsWith('/frontline/tickets');
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
        actions={
          <NavigationGroupActions>
            <CreateChannel isIconOnly />
          </NavigationGroupActions>
        }
      >
        <ChooseChannel />
      </NavigationMenuGroup>
    );
  }
  if (!isInbox) return null;
  return (
    <>
      <InboxWorkNav />
      <PersonalInboxNav />
      <TeamChannelsNav />
      <DiscordServersNav />
      <NavigationMenuGroup
        name="Brands"
        actions={
          <NavigationGroupActions>
            <CreateBrand />
          </NavigationGroupActions>
        }
      >
        <ChooseBrand />
      </NavigationMenuGroup>
    </>
  );
};
