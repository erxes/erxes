import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Badge,
  Button,
  Dialog,
  Form,
  RadioGroup,
  Select,
  Spinner,
  useToast,
} from 'erxes-ui';
import {
  GITHUB_TEAM_CONNECTION_SCHEMA,
  TGithubTeamConnectionForm,
} from '../schemas';
import { LinkRepoDialogProps } from '../types';
import {
  useGithubRepositories,
  useUpsertGithubConfig,
} from '../hooks/useGithubIntegration';

export function LinkRepoDialog({
  open,
  onClose,
  teamId,
  connections,
  currentConfig,
  linkedRepoNames,
  onSaved,
  onInstallOrganization,
}: LinkRepoDialogProps) {
  const { toast } = useToast();
  const hasCurrentInstallation = connections.some(
    (connection) => connection.installationId === currentConfig?.installationId,
  );
  const initialInstallationId = hasCurrentInstallation
    ? currentConfig?.installationId
    : connections[0]?.installationId;
  const initialRepoName = hasCurrentInstallation
    ? (currentConfig?.repoName ?? '')
    : '';
  const form = useForm<TGithubTeamConnectionForm>({
    resolver: zodResolver(GITHUB_TEAM_CONNECTION_SCHEMA),
    defaultValues: {
      installationId: initialInstallationId ?? 0,
      repoName: initialRepoName,
      syncMode: currentConfig?.syncMode ?? 'twoWay',
    },
  });
  const installationId = form.watch('installationId');
  const {
    data: repositories,
    loading: repositoriesLoading,
    error: repositoriesError,
  } = useGithubRepositories(installationId, !open || !installationId);
  const { upsertConfig, saving } = useUpsertGithubConfig(
    () => {
      toast({ title: 'GitHub repository connected' });
      onSaved();
      onClose();
    },
    (error) => {
      form.setError('root', { message: error.message });
    },
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      installationId: initialInstallationId ?? 0,
      repoName: initialRepoName,
      syncMode: currentConfig?.syncMode ?? 'twoWay',
    });
  }, [
    currentConfig?.syncMode,
    form,
    initialInstallationId,
    initialRepoName,
    open,
  ]);

  const availableRepositories = repositories.filter(
    (repository) =>
      repository.fullName === currentConfig?.repoName ||
      !linkedRepoNames.includes(repository.fullName),
  );

  function handleOrganizationChange(value: string) {
    form.setValue('installationId', Number(value), { shouldValidate: true });
    form.setValue('repoName', '', { shouldValidate: false });
  }

  function handleSubmit(values: TGithubTeamConnectionForm) {
    upsertConfig({
      variables: {
        teamId,
        repoName: values.repoName,
        installationId: values.installationId,
        syncMode: values.syncMode,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Content className="max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Dialog.Header>
              <Dialog.Title>Connect GitHub repository</Dialog.Title>
              <Dialog.Description>
                Choose the organization and repository this team should use.
              </Dialog.Description>
            </Dialog.Header>

            <div className="space-y-4 py-4">
              {form.formState.errors.root?.message ? (
                <Alert variant="destructive">
                  {form.formState.errors.root.message}
                </Alert>
              ) : null}

              <Form.Field
                control={form.control}
                name="installationId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>GitHub organization</Form.Label>
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={handleOrganizationChange}
                    >
                      <Form.Control>
                        <Select.Trigger className="border">
                          <Select.Value placeholder="Choose an organization…" />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {connections.map((connection) => (
                          <Select.Item
                            key={connection.installationId}
                            value={String(connection.installationId)}
                          >
                            {connection.orgName}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {repositoriesError ? (
                <Alert variant="destructive">
                  Could not load repositories for this organization. Check the
                  GitHub App repository access and try again.
                </Alert>
              ) : null}

              <Form.Field
                control={form.control}
                name="repoName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>GitHub repository</Form.Label>
                    {repositoriesLoading ? (
                      <div
                        className="flex justify-start h-8 w-full items-center gap-2 rounded border border-border px-3 text-sm text-muted-foreground"
                        role="status"
                      >
                        <Spinner
                          size="sm"
                          containerClassName="h-auto flex-none"
                        />
                        <span>Loading repositories…</span>
                      </div>
                    ) : (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!installationId}
                      >
                        <Form.Control>
                          <Select.Trigger className="border">
                            <Select.Value placeholder="Choose a repository…" />
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          {availableRepositories.map((repository) => (
                            <Select.Item
                              key={repository.fullName}
                              value={repository.fullName}
                            >
                              {repository.fullName}
                              {repository.isPrivate ? (
                                <Badge variant="secondary" className="ml-2">
                                  Private
                                </Badge>
                              ) : null}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    )}
                    {!repositoriesLoading &&
                    !repositoriesError &&
                    installationId &&
                    availableRepositories.length === 0 ? (
                      <Form.Description>
                        Every accessible repository in this organization is
                        already linked to another team.
                      </Form.Description>
                    ) : null}
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="syncMode"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Task creation direction</Form.Label>
                    <Form.Description>
                      Choose whether erxes tasks should also create GitHub
                      issues.
                    </Form.Description>
                    <Form.Control>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="mt-3 space-y-2"
                      >
                        <label className="flex cursor-pointer items-center gap-2">
                          <RadioGroup.Item value="oneWay" />
                          GitHub issues create erxes tasks
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <RadioGroup.Item value="twoWay" />
                          GitHub issues and erxes tasks sync both ways
                        </label>
                      </RadioGroup>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onInstallOrganization}
              >
                + Install on another organization
              </Button>
            </div>

            <Dialog.Footer>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  saving ||
                  Boolean(repositoriesError) ||
                  availableRepositories.length === 0
                }
              >
                {saving ? <Spinner size="sm" /> : 'Save connection'}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
}
