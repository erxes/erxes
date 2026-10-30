import { useState } from 'react';
import { IconShieldCheck } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import {
  Breadcrumb,
  Button,
  Label,
  RadioGroup,
  Separator,
  Spinner,
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
  AgentsApprovalMode,
  IAgentsSettingsUpdateData,
  IAgentsSettingsUpdateVariables,
} from '@/agent/graphql/settings';
import { useAgentsSettings } from '@/agent/hooks/useAgentsSettings';

const MODES: {
  value: AgentsApprovalMode;
  labelKey: string;
  descriptionKey: string;
}[] = [
  {
    value: 'writes',
    labelKey: 'approval-writes-label',
    descriptionKey: 'approval-writes-description',
  },
  {
    value: 'destructive',
    labelKey: 'approval-destructive-label',
    descriptionKey: 'approval-destructive-description',
  },
];

/**
 * Tenant-wide approval policy: which tool calls the agent must ask about
 * before running. Every agents user can read the state; only admins
 * (`manageAgentsSettings`) can change it — the radio group is disabled for
 * everyone else.
 */
export const AgentSettingsApprovalsPage = () => {
  const { openPath } = useSidePanel();
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const { settings, loading, error } = useAgentsSettings();
  const { isLoaded, hasActionPermission } = usePermissionCheck();

  const canManage = isLoaded && hasActionPermission('manageAgentsSettings');
  const [pending, setPending] = useState<AgentsApprovalMode | null>(null);
  const mode: AgentsApprovalMode =
    pending ??
    (settings?.approvalMode === 'destructive' ? 'destructive' : 'writes');

  const [updateSettings, { loading: saving }] = useMutation<
    IAgentsSettingsUpdateData,
    IAgentsSettingsUpdateVariables
  >(AGENTS_SETTINGS_UPDATE, {
    refetchQueries: [{ query: AGENTS_SETTINGS }],
    onCompleted: () => {
      setPending(null);
      toast({ title: t('approval-mode-saved', 'Approval policy updated') });
    },
    onError: (updateError) => {
      setPending(null);
      toast({
        title: t('approval-mode-failed', 'Failed to update approval policy'),
        description: updateError.message,
        variant: 'destructive',
      });
    },
  });

  const handleChange = (value: string) => {
    if (saving || (value !== 'writes' && value !== 'destructive')) {
      return;
    }

    setPending(value);
    void updateSettings({ variables: { approvalMode: value } });
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
                  <IconShieldCheck />
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
                  {t('approvals', 'Approvals')}
                </span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={['AI Agent', 'Settings', 'Approvals']}
            icon="IconShieldCheck"
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
              <Label className="font-sans text-sm font-medium normal-case">
                {t('approvals-title', 'Tool approvals')}
              </Label>
              <RadioGroup
                className="mt-4 gap-3"
                value={mode}
                onValueChange={handleChange}
                disabled={!canManage || saving}
              >
                {MODES.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start gap-3 rounded-lg border p-3 has-data-[state=checked]:border-primary/60 has-data-[state=checked]:bg-accent/40"
                  >
                    <RadioGroup.Item
                      value={option.value}
                      aria-label={t(option.labelKey)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {t(option.labelKey)}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {t(option.descriptionKey)}
                      </span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
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
