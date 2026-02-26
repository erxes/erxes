import {
  IconMail,
  IconDotsVertical,
  IconSettings,
  IconTicket,
  IconChartHistogram,
  IconForms,
  IconBook,
  IconPlus,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem, DropdownMenu, Button, Spinner, Skeleton, Badge } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { IntegrationNavigation } from '@/integrations/components/IntegrationNavigation';
import { useConversations } from './inbox/conversations/hooks/useConversations';
export const FrontlineNavigation = () => {
  const navigate = useNavigate();

  return (
    <>
      <NavigationMenuLinkItem
        name="Inbox"
        icon={IconMail}
        path="frontline/inbox"
        children={<NotificationCount />}
      />
      <NavigationMenuLinkItem
        name="Tickets"
        icon={IconTicket}
        path="frontline/tickets"
      />
      <NavigationMenuLinkItem
        name="Reports"
        icon={IconChartHistogram}
        path="frontline/reports"
      />
      <IntegrationNavigation />
      <NavigationMenuLinkItem
        name="Forms"
        icon={IconForms}
        path="frontline/forms"
      />
      <div className="relative group/knowledgebase">
        <NavigationMenuLinkItem
          name="Knowledge Base"
          icon={IconBook}
          path="frontline/knowledgebase"
        />

        <Button
          variant="ghost"
          size="icon"
          className="invisible group-hover/knowledgebase:visible group-focus-within/knowledgebase:visible absolute top-1/2 -translate-y-1/2 right-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/frontline/knowledgebase?createTopic=true');
          }}
          aria-label="Create new topic"
          title="Create new topic"
        >
          <IconPlus className="size-4" />
        </Button>
      </div>
    </>
  );
};


export const NotificationCount = () => {
  const { totalCount, loading } = useConversations({
    variables: {
      status: 'new',
    },
  });

  if (loading) {
    return <Skeleton className="size-4 rounded-sm" />;
  }

  if (totalCount === 0) {
    return null;
  }

  return (
    <Badge className="ml-auto text-xs min-w-6 px-1 justify-center">
      {totalCount}
    </Badge>
  );
};
