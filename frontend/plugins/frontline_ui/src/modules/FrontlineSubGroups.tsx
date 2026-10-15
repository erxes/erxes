import { NavigationMenuGroup, useQueryState } from 'erxes-ui';

import { ChooseBrand } from '@/inbox/brand/components/ChooseBrand';
import { ChooseChannel } from '@/inbox/channel/components/ChooseChannel';
import { ChooseFormTag } from '@/forms/components/form-page/ChooseFormTag';
import { CreateBrand } from '@/inbox/brand/components/CreateBrand';
import { CreateChannel } from '@/channels/components/settings/channels-list/CreateChannel';
import { DiscordServersNav } from '@/integrations/discord/components/DiscordChannelsNav';
import { InboxWorkNav } from '@/inbox/components/InboxWorkNav';
import { NavigationGroupActions } from '@/NavigationGroupActions';
import { PersonalInboxNav } from '@/inbox/channel/components/PersonalInboxNav';
import { TeamChannelsNav } from '@/inbox/channel/components/TeamChannelsNav';
import { TicketNavigations } from '@/ticket/components/ticket-navigations/TicketNavigations';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const FrontlineSubGroups = () => {
  const { t } = useTranslation('frontline');
  const { pathname } = useLocation();
  const [brandId] = useQueryState<string>('brandId');
  const isInbox = pathname.startsWith('/frontline/inbox');
  const isTickets = pathname.startsWith('/frontline/tickets');
  const isForms = pathname.startsWith('/frontline/forms');
  const isSurveys = pathname.startsWith('/frontline/surveys');
  if (isTickets) {
    return <TicketNavigations />;
  }
  if (isForms || isSurveys) {
    return (
      <>
        <NavigationMenuGroup
          name={t('channels')}
          actions={
            <NavigationGroupActions>
              <CreateChannel isIconOnly />
            </NavigationGroupActions>
          }
        >
          <ChooseChannel />
        </NavigationMenuGroup>
        <NavigationMenuGroup name={t('tags')}>
          <ChooseFormTag />
        </NavigationMenuGroup>
      </>
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
        defaultOpen={Boolean(brandId)}
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
