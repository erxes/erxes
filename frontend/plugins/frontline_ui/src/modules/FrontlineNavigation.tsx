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
import { NavigationMenuLinkItem, DropdownMenu, Button } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { IntegrationNavigation } from '@/integrations/components/IntegrationNavigation';
export const FrontlineNavigation = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="relative group/inbox">
        <NavigationMenuLinkItem
          name="Inbox"
          icon={IconMail}
          path="frontline/inbox"
        />

        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="invisible group-hover/inbox:visible absolute top-1/2 -translate-y-1/2 right-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <IconDotsVertical className="size-4" />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            side="right"
            align="start"
            className="w-60 min-w-0"
          >
            <DropdownMenu.Item
              className="cursor-pointer"
              onSelect={() => navigate('/settings/frontline/channels')}
            >
              <IconSettings className="size-4" />
              Go to inbox settings
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
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
