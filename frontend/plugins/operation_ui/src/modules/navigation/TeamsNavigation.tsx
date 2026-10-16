import { useTranslation } from 'react-i18next';
import { useGetTeam } from '@/team/hooks/useGetTeam';
import { useMatch, useNavigate } from 'react-router-dom';
import {
  Button,
  DropdownMenu,
  NavigationMenuGroup,
  NavigationMenuLinkItem,
  Skeleton,
  useToast,
} from 'erxes-ui';
import {
  IconRestore,
  IconChecklist,
  IconClipboard,
  IconDotsVertical,
  IconLink,
  IconSettings,
  IconCaretLeftRight,
} from '@tabler/icons-react';

function LoadingSkeleton() {
  return (
    <div className="space-y-4 px-4 py-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-full h-4" />
      ))}
    </div>
  );
}

function ActiveTeamNavigation({ teamId }: Readonly<{ teamId: string }>) {
  const { t } = useTranslation('operation');
  const { team, loading } = useGetTeam(teamId);

  if (loading && !team) {
    return <LoadingSkeleton />;
  }

  if (!team) {
    return null;
  }

  return (
    <NavigationMenuGroup
      name={team.name ?? t('team')}
      actions={<TeamActionsMenu teamId={team._id} />}
    >
      {team.triageEnabled && (
        <NavigationMenuLinkItem
          name={t('triage')}
          pathPrefix="operation/team"
          path={`${team._id}/triage`}
          icon={IconCaretLeftRight}
        />
      )}
      <NavigationMenuLinkItem
        name={t('projects')}
        pathPrefix="operation/team"
        path={`${team._id}/projects`}
        icon={IconClipboard}
      />
      <NavigationMenuLinkItem
        name={t('tasks')}
        pathPrefix="operation/team"
        path={`${team._id}/tasks`}
        icon={IconChecklist}
      />
      {team.cycleEnabled && (
        <NavigationMenuLinkItem
          name={t('cycles')}
          pathPrefix="operation/team"
          path={`${team._id}/cycles`}
          icon={IconRestore}
        />
      )}
    </NavigationMenuGroup>
  );
}

export function TeamsNavigation() {
  const teamId = useMatch('/operation/team/:teamId/*')?.params.teamId;

  if (!teamId) {
    return null;
  }

  return <ActiveTeamNavigation teamId={teamId} />;
}

const TeamActionsMenu = ({ teamId }: Readonly<{ teamId: string }>) => {
  const { t } = useTranslation('operation');
  const navigate = useNavigate();

  const { toast } = useToast();

  const handleCopyLink = async () => {
    const teamLink = `${window.location.origin}/operation/team/${teamId}/tasks`;
    try {
      await navigator.clipboard.writeText(teamLink);
      toast({
        variant: 'default',
        title: t('link-copied-to-clipboard'),
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: t('failed-to-copy-link'),
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
          className="size-5 text-muted-foreground"
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
          onSelect={() => {
            navigate(`/settings/operation/team/details/${teamId}`);
          }}
        >
          <IconSettings className="size-4" />
          {t('go-to-team-settings')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={handleCopyLink} className="cursor-pointer">
          <IconLink className="size-4" />
          {t('copy-link')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
