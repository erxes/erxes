import { IconCode, IconServer } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import {
  Breadcrumb,
  Button,
  Label,
  Separator,
  Spinner,
  Switch,
  toast,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  usePermissionCheck,
  SIDE_PANEL_CHAT_PATH,
  useSidePanel,
} from 'ui-modules';

import {
  AGENTS_SETTINGS,
  AGENTS_SETTINGS_UPDATE,
} from '@/agent/graphql/settings';
import type {
  IAgentsSettingsUpdateData,
  IAgentsSettingsUpdateVariables,
} from '@/agent/graphql/settings';
import { useAgentsSettings } from '@/agent/hooks/useAgentsSettings';

/**
 * Tenant-wide "Code mode" settings: when enabled, every user's chat agent
 * additionally carries the sandboxed `execute_typescript` tool (model-
 * authored TypeScript runs in the server's in-process QuickJS sandbox).
 * Every agents user can read the state; only admins (`manageAgentsSettings`)
 * can change it — the switch is disabled for everyone else.
 */
export const AgentSettingsCodeModePage = () => {
  const { openPath } = useSidePanel();
  const { settings, loading, error } = useAgentsSettings();
  const { isLoaded, hasActionPermission } = usePermissionCheck();

  const canManage = isLoaded && hasActionPermission('manageAgentsSettings');
  const enabled = settings?.codeModeEnabled === true;

  const [updateSettings, { loading: saving }] = useMutation<
    IAgentsSettingsUpdateData,
    IAgentsSettingsUpdateVariables
  >(AGENTS_SETTINGS_UPDATE, {
    refetchQueries: [{ query: AGENTS_SETTINGS }],
    onCompleted: (data) => {
      toast({
        title:
          data?.agentsSettingsUpdate?.codeModeEnabled === true
            ? 'Code mode enabled'
            : 'Code mode disabled',
      });
    },
    onError: (updateError) => {
      toast({
        title: 'Failed to update code mode',
        description: updateError.message,
        variant: 'destructive',
      });
    },
  });

  const handleToggle = (checked: boolean) => {
    if (saving) {
      return;
    }

    void updateSettings({ variables: { codeModeEnabled: checked } });
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button
                  variant="ghost"
                  onClick={() => openPath(SIDE_PANEL_CHAT_PATH)}
                >
                  <IconCode />
                  Agents
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/agent">Settings</Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="text-muted-foreground">Code mode</span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={['Agents', 'Settings', 'Code mode']}
            icon="IconCode"
          />
        </PageHeader.Start>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner className="size-5" />
          </div>
        ) : error ? (
          <p className="mx-auto max-w-xl p-6 text-sm text-destructive">
            {error}
          </p>
        ) : (
          <div className="mx-auto max-w-xl space-y-4 p-6">
            <div className="rounded-xl border p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <Label className="font-sans text-sm font-medium normal-case">
                    Code mode
                  </Label>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    Lets the agent write and run TypeScript in a sandbox to
                    search, aggregate, and compute across your workspace tools,
                    then answer with one result.
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  disabled={!canManage || saving}
                  onCheckedChange={handleToggle}
                  aria-label="Enable code mode"
                />
              </div>
              {!canManage && (
                <p className="mt-4 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                  Managed by your administrators.
                </p>
              )}
            </div>

            <div className="rounded-xl border p-6">
              <Label className="font-sans text-sm font-medium normal-case">
                Sandbox environment
              </Label>
              <div className="mt-3 flex items-start gap-3 rounded-lg border p-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <IconServer className="size-4 text-muted-foreground" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    In-process (built-in server)
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                      Default
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Code runs inside this server in an isolated WebAssembly
                    interpreter — no filesystem, network, or process access.
                    Destructive tool calls always stay behind the normal
                    approval prompt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
