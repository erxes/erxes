import { useEffect, useState } from 'react';
import { IconFileText } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import {
  Breadcrumb,
  Button,
  Label,
  Separator,
  Spinner,
  Textarea,
  toast,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

// Mirrors AGENTS_INSTRUCTIONS_MAX_LENGTH on the server, which enforces it.
const MAX_LENGTH = 8000;

/**
 * Tenant-wide guidance the assistant follows in every chat, such as the
 * fiscal year start or what a pipeline name means. Every agents user can read
 * it; only admins (`manageAgentsSettings`) can change it.
 */
export const AgentSettingsInstructionsPage = () => {
  const { openPath } = useSidePanel();
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const { settings, loading, error } = useAgentsSettings();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManage = isLoaded && hasActionPermission('manageAgentsSettings');

  const saved = settings?.instructions ?? '';
  const [draft, setDraft] = useState(saved);

  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  const [updateSettings, { loading: saving }] = useMutation<
    IAgentsSettingsUpdateData,
    IAgentsSettingsUpdateVariables
  >(AGENTS_SETTINGS_UPDATE, {
    refetchQueries: [{ query: AGENTS_SETTINGS }],
    onCompleted: () => {
      toast({ title: t('instructions-saved', 'Instructions saved') });
    },
    onError: (updateError) => {
      toast({
        title: t('instructions-failed', 'Failed to save instructions'),
        description: updateError.message,
        variant: 'destructive',
      });
    },
  });

  const tooLong = draft.trim().length > MAX_LENGTH;
  const unchanged = draft.trim() === saved.trim();

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
                  <IconFileText />
                  {t('assistant', 'Assistant')}
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/agent">{t('settings', 'Settings')}</Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="text-muted-foreground">
                  {t('instructions', 'Instructions')}
                </span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={['AI Agent', 'Settings', 'Instructions']}
            icon="IconFileText"
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
              <Label
                htmlFor="agent-workspace-instructions"
                className="font-sans text-sm font-medium normal-case"
              >
                {t('instructions-title', 'Workspace instructions')}
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(
                  'instructions-description',
                  'The assistant follows these in every chat, for example: our fiscal year starts in April; "Hot" means the Enterprise pipeline; show amounts in MNT.',
                )}
              </p>
              <Textarea
                id="agent-workspace-instructions"
                className="mt-4 min-h-48"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={!canManage || saving}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span
                  className={
                    tooLong
                      ? 'text-xs text-destructive'
                      : 'text-xs text-muted-foreground'
                  }
                >
                  {draft.trim().length} / {MAX_LENGTH}
                </span>
                {canManage && (
                  <Button
                    disabled={saving || unchanged || tooLong}
                    onClick={() =>
                      void updateSettings({
                        variables: { instructions: draft.trim() },
                      })
                    }
                  >
                    {saving && <Spinner className="size-4" />}
                    {t('save', 'Save')}
                  </Button>
                )}
              </div>
              {!canManage && (
                <p className="mt-4 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                  {t('managed-by-admins', 'Managed by your administrators.')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
