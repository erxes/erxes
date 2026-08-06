import { useState } from 'react';
import {
  Dialog,
  Label,
  Select,
  Spinner,
  Separator,
  RadioGroup,
  Button,
  Alert,
  Badge,
} from 'erxes-ui';
import { LinkRepoDialogProps } from '../types';
import {
  useGithubRepositories,
  useTeams,
  useUpsertGithubConfig,
} from '../hooks/useGithubIntegration';

export function LinkRepoDialog({
  open,
  onClose,
  installationId,
  orgName,
  onSaved,
  linkedRepos,
}: LinkRepoDialogProps) {
  const [teamId, setTeamId] = useState('');
  const [repoFullName, setRepoFullName] = useState('');
  const [syncMode, setSyncMode] = useState<'oneWay' | 'twoWay'>('twoWay');
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: repos, loading: reposLoading } = useGithubRepositories(
    installationId,
    !open,
  );
  const { data: teams, loading: teamsLoading } = useTeams(!open);

  const { upsertConfig, saving } = useUpsertGithubConfig(
    () => {
      onSaved();
      onClose();
    },
    (err) => setSaveError(err.message),
  );

  function handleSave() {
    if (!teamId || !repoFullName) return;
    setSaveError(null);
    upsertConfig({
      variables: {
        teamId,
        repoName: repoFullName,
        installationId,
        syncMode,
      },
    });
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setTeamId('');
      setRepoFullName('');
      setSyncMode('twoWay');
      setSaveError(null);
      onClose();
    }
  }

  const availableRepos = repos.filter((r) => !linkedRepos.includes(r.fullName));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>Link GitHub repo to erxes team</Dialog.Title>
          <Dialog.Description>
            Choose a GitHub repository to link to a team. Issues will be synced
            between the two.
          </Dialog.Description>
        </Dialog.Header>

        <div className="space-y-4">
          {saveError && (
            <Alert variant="error" onClose={() => setSaveError(null)}>
              {saveError}
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label>GitHub organization</Label>
            <div className="flex h-8 w-full items-center rounded border bg-muted px-3 text-sm text-muted-foreground">
              {orgName}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>GitHub repository</Label>
            {reposLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner size="sm" /> Loading repositories…
              </div>
            ) : availableRepos.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                All repositories are already linked.
              </div>
            ) : (
              <Select value={repoFullName} onValueChange={setRepoFullName}>
                <Select.Trigger className="border">
                  <Select.Value placeholder="Choose a repository…" />
                </Select.Trigger>
                <Select.Content>
                  {availableRepos.map((r) => (
                    <Select.Item key={r.fullName} value={r.fullName}>
                      {r.fullName}
                      {r.isPrivate && (
                        <Badge variant="outline" size="sm" className="ml-2">
                          Private
                        </Badge>
                      )}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Team</Label>
            {teamsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner size="sm" /> Loading teams…
              </div>
            ) : (
              <Select value={teamId} onValueChange={setTeamId}>
                <Select.Trigger className="border">
                  <Select.Value placeholder="Choose a team…" />
                </Select.Trigger>
                <Select.Content>
                  {teams.map((t) => (
                    <Select.Item key={t._id} value={t._id}>
                      {t.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Task creation direction</Label>
            <p className="text-xs text-muted-foreground">
              This only affects task creation. Updates to synced tasks will
              always be synced in both directions between erxes and GitHub.
            </p>
            <RadioGroup
              value={syncMode}
              onValueChange={(v: string) =>
                setSyncMode(v as 'oneWay' | 'twoWay')
              }
              className="space-y-2 mt-3"
            >
              <div className="flex items-center gap-2">
                <RadioGroup.Item value="oneWay" id="sync-oneWay" />
                <Label
                  htmlFor="sync-oneWay"
                  className="cursor-pointer font-medium"
                >
                  Only sync issues from this repository to erxes
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroup.Item value="twoWay" id="sync-twoWay" />
                <Label
                  htmlFor="sync-twoWay"
                  className="cursor-pointer font-medium"
                >
                  Two-way sync issues between erxes and this repository
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Dialog.Footer>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !teamId || !repoFullName || saving || availableRepos.length === 0
            }
          >
            {saving ? <Spinner size="sm" /> : 'Save'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
