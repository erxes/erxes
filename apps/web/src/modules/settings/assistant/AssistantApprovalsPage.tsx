import { AssistantApprovalMode } from '@erxes/core-contract';
import { IconShieldQuestion } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Label, RadioGroup, useToast } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { paths } from '~/lib/paths';
import { OrgSettingsPage } from './OrgSettingsPage';

const useModeText = () => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });

  return {
    writes: {
      label: t('approval-writes', 'Before every change'),
      description: t(
        'approval-writes-description',
        'The assistant asks before it creates, edits or deletes anything.',
      ),
    },
    destructive: {
      label: t('approval-destructive', 'Before risky changes only'),
      description: t(
        'approval-destructive-description',
        'It asks before deleting, merging, archiving, publishing or sending. Other edits go ahead.',
      ),
    },
  };
};

const ApprovalChoice = ({ value }: { value: AssistantApprovalMode }) => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });
  const { toast } = useToast();
  const client = useQueryClient();
  const id = useId();
  const text = useModeText();

  const update = useMutation(
    orpc.assistant.updateSettings.mutationOptions({
      onSuccess: () => {
        toast({ title: t('approval-saved', 'Saved') });
        void client.invalidateQueries({ queryKey: orpc.assistant.settings.key() });
      },
      onError: (error) => toast({ variant: 'destructive', title: messageOf(error) }),
    }),
  );

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-medium">
        {t('approval-legend', 'When should the assistant ask first?')}
      </legend>
      <RadioGroup
        value={update.variables?.approvalMode ?? value}
        disabled={update.isPending}
        onValueChange={(next) => {
          const mode = AssistantApprovalMode.safeParse(next);

          if (mode.success) update.mutate({ approvalMode: mode.data });
        }}
      >
        {AssistantApprovalMode.options.map((mode) => (
          <div key={mode} className="flex items-start gap-2 rounded-lg border p-3">
            <RadioGroup.Item id={`${id}-${mode}`} value={mode} />
            <div className="flex flex-col gap-0.5">
              <Label htmlFor={`${id}-${mode}`} variant="plain">
                {text[mode].label}
              </Label>
              <p className="text-sm text-muted-foreground">{text[mode].description}</p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
};

export const AssistantApprovalsPage = () => {
  const { t } = useTranslation('assistant', { keyPrefix: 'settings' });

  const crumb = {
    label: t('approvals-title', 'Assistant approvals'),
    to: paths.settings.assistantApprovals,
    icon: IconShieldQuestion,
  };

  return (
    <OrgSettingsPage crumb={crumb}>
      {(settings) => (
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            {t(
              'approvals-intro',
              'This applies to every member. The assistant always acts as the member who asked, within their role.',
            )}
          </p>
          <QueryState query={settings}>
            {({ approvalMode }) => <ApprovalChoice value={approvalMode} />}
          </QueryState>
        </div>
      )}
    </OrgSettingsPage>
  );
};
