import { useGetTeams } from '@/team/hooks/useGetTeams';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Collapsible,
  DropdownMenu,
  IconComponent,
  NavigationMenuGroup,
  NavigationMenuLinkItem,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  useToast,
} from 'erxes-ui';
import {
  IconRestore,
  IconCaretRightFilled,
  IconChecklist,
  IconClipboard,
  IconDotsVertical,
  IconLink,
  IconSettings,
} from '@tabler/icons-react';

type Team = {
  _id: string;
  name: string;
  icon?: string;
  cycleEnabled: boolean;
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-full h-4" />
      ))}
    </div>
  );
}

interface TeamItemProps {
  team: Team;
}

function TeamItem({ team }: TeamItemProps) {
  return (
    <Collapsible className="group/collapsible">
      <Sidebar.Group className="p-0">
        <div className="w-full relative group/trigger hover:cursor-pointer">
          <Collapsible.Trigger asChild>
            <div className="w-full flex items-center justify-between">
              <Button
                variant="ghost"
                className="px-2 flex min-w-0 justify-start"
              >
                <IconComponent
                  name={team.icon}
                  className="text-accent-foreground flex-shrink-0"
                />
                <TextOverflowTooltip
                  className="font-sans font-semibold normal-case flex-1 min-w-0"
                  value={team.name}
                />
                <span className="ml-auto flex-shrink-0">
                  <IconCaretRightFilled className="size-3 transition-transform group-data-[state=open]/collapsible:rotate-90 text-accent-foreground" />
                </span>
              </Button>
              <div className="size-5 min-w-5 mr-2"></div>
            </div>
          </Collapsible.Trigger>
          <TeamActionsMenu team={team} />
        </div>
        <Collapsible.Content className="pt-1">
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <NavigationMenuLinkItem
                name="Projects"
                pathPrefix="operation/team"
                className="pl-6 font-medium"
                icon={IconClipboard}
                path={`${team._id}/projects`}
              />
              <NavigationMenuLinkItem
                name="Tasks"
                pathPrefix="operation/team"
                path={`${team._id}/tasks`}
                className="pl-6 font-medium"
                icon={IconChecklist}
              />
              {team.cycleEnabled && (
                <NavigationMenuLinkItem
                  name="Cycles"
                  pathPrefix="operation/team"
                  path={`${team._id}/cycles`}
                  className="pl-6 font-medium"
                  icon={IconRestore}
                />
              )}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Collapsible.Content>
      </Sidebar.Group>
    </Collapsible>
  );
}

export function TeamsNavigation() {
  const currentUser = useAtomValue(currentUserState);
  const { teams, loading } = useGetTeams({
    variables: { userId: currentUser?._id },
  });

  return (
    <NavigationMenuGroup name="Your Teams">
      {loading ? (
        <LoadingSkeleton />
      ) : (
        teams?.map((team) => <TeamItem key={team._id} team={team} />)
      )}
    </NavigationMenuGroup>
  );
}

const TeamActionsMenu = ({ team }: { team: Team }) => {
  const navigate = useNavigate();

  const { toast } = useToast();

  const handleCopyLink = async () => {
    const teamLink = `${window.location.origin}/operation/team/${team._id}/tasks`;
    try {
      await navigator.clipboard.writeText(teamLink);
      toast({
        variant: 'default',
        title: 'Link copied to clipboard',
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Failed to copy link',
        description: e as string,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="invisible group-hover/trigger:visible absolute top-1/2 -translate-y-1/2 right-1 text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <IconDotsVertical className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="right" align="start" className="w-60 min-w-0">
        <DropdownMenu.Item
          className="cursor-pointer"
          onSelect={(e) => {
            navigate(`/settings/operation/team/details/${team._id}`);
          }}
        >
          <IconSettings className="size-4" />
          Go to team settings
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={(e) => {
            handleCopyLink();
          }}
          className="cursor-pointer"
        >
          <IconLink className="size-4" />
          Copy link
        </DropdownMenu.Item>

        {/* <DropdownMenu.Item className="cursor-pointer">
          <IconArchive className="size-4" />
          Archive team
        </DropdownMenu.Item>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger className="text-base justify-between">
            <span className="flex items-center gap-2">
              <IconBell className="size-4" />
              Subscribe
            </span>
            <IconChevronRight className="size-4" />
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item onClick={(e) => e.preventDefault()}>
              <Checkbox />
              An issue is added to the team
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={(e) => e.preventDefault()}>
              <Checkbox />
              An issue is marked completed or cancelled
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={(e) => e.preventDefault()}>
              <Checkbox />
              An issue is added to the triage queue
            </DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub> */}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
