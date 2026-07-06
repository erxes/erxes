import { useState } from 'react';
import { Card, Button, Spinner, Badge } from 'erxes-ui';
import { LinkRepoDialog } from './LinkRepoDialog';
import { GithubIssuesSectionProps } from '../types';
import {
  IconArrowRight,
  IconArrowsHorizontal,
  IconBrandGithub,
} from '@tabler/icons-react';
import {
  useGithubIssuesSectionData,
  useGithubRepositories,
} from '../hooks/useGithubIntegration';

export function GithubIssuesSection({
  installationId,
  orgName,
}: GithubIssuesSectionProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const { data, loading, refetch } = useGithubIssuesSectionData(installationId);
  const { data: repos, loading: reposLoading } =
    useGithubRepositories(installationId);

  const configs = data?.getAllGithubConfigs ?? [];
  const teams = data?.getTeams ?? [];

  const teamById = Object.fromEntries(teams.map((t) => [t._id, t]));
  const linkedRepos = configs.map((c) => c.repoName);

  // Disable if all repos are linked
  const isAllLinked = repos.length > 0 && availableReposCount() === 0;

  function availableReposCount() {
    return repos.filter((r) => !linkedRepos.includes(r.fullName)).length;
  }

  return (
    <>
      <Card>
        <Card.Header className="flex flex-row items-center justify-between">
          <div className="pr-6">
            <Card.Title>GitHub Issues</Card.Title>
            <Card.Description>
              Automatically create issues and sync properties from GitHub
              repositories into erxes teams.
            </Card.Description>
          </div>
          <Button
            size="sm"
            onClick={() => setLinkDialogOpen(true)}
            disabled={isAllLinked && !reposLoading}
            className="self-start shrink-0"
          >
            + Link repo
          </Button>
        </Card.Header>

        <Card.Content>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : configs.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No repositories linked yet. Click "Link repo" to get started.
            </p>
          ) : (
            <ul className="space-y-2">
              {configs.map((cfg) => {
                const team = teamById[cfg.teamId];
                return (
                  <li
                    key={cfg._id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <IconBrandGithub className="size-6" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold ">
                            {cfg.repoName.split('/')[1]}
                          </span>
                          {cfg.syncMode === 'twoWay' ? (
                            <IconArrowsHorizontal size={16} />
                          ) : (
                            <IconArrowRight size={16} />
                          )}
                          <span>{team ? team.name : 'Unknown Team'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {cfg.repoName}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" size="sm">
                      {cfg.syncMode === 'twoWay' ? 'Two-way' : 'One-way'}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card.Content>
      </Card>

      <LinkRepoDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        installationId={installationId}
        orgName={orgName}
        onSaved={refetch}
        linkedRepos={linkedRepos}
      />
    </>
  );
}
