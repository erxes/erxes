import { ChooseChannel } from '@/inbox/channel/components/ChooseChannel';
import { ChooseBrand } from '@/inbox/brand/components/ChooseBrand';
import { CreateBrand } from '@/inbox/brand/components/CreateBrand';
import { CreateChannel } from '@/channels/components/settings/channels-list/CreateChannel';
import { Input, NavigationMenuGroup } from 'erxes-ui';
import { TicketNavigations } from '@/ticket/components/ticket-navigations/TicketNavigations';
import { KnowledgeBaseSubGroup } from '@/knowledgebase/components/KnowledgeBaseTopicsNav';
import { DiscordServersNav } from '@/integrations/discord/components/DiscordChannelsNav';
import { PersonalInboxNav } from '@/inbox/channel/components/PersonalInboxNav';
import { TeamChannelsNav } from '@/inbox/channel/components/TeamChannelsNav';
import { NavigationGroupActions } from '@/NavigationGroupActions';
import { useTranslation } from 'react-i18next';
import { IconSearch } from '@tabler/icons-react';

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

export const SearchConversations = () => {
  const { t } = useTranslation('frontline');
  return (
    <label className="flex items-center has-focus-visible:shadow-focus bg-muted text-accent-foreground/70 has-focus-visible:text-foreground rounded-sm ps-2 transition-[color,box-shadow]">
      <IconSearch size={16} />
      <Input
        className=" focus-visible:shadow-none bg-transparent shadow-none ps-2 h-7 pr-7 text-xs"
        type="search"
        placeholder={t('search-conversations')}
      />
    </label>
  );
};
