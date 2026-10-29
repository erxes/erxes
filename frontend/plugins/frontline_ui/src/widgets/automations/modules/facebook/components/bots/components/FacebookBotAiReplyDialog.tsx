import {
  IconAlertTriangle,
  IconExternalLink,
  IconPlus,
} from '@tabler/icons-react';
import {
  Alert,
  Button,
  Dialog,
  Form,
  Select,
  Skeleton,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { automationReturnLinkSearch } from 'ui-modules';
import { useFacebookBotAiReplyForm } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotAiReplyForm';
import { TAiReplyChannel } from '~/widgets/automations/modules/facebook/components/bots/utils/buildAiReplySeedLink';
import { TTriggerClaim } from '~/widgets/automations/modules/facebook/components/trigger/hooks/useFacebookBotTriggerClaims';

const AI_AGENT_CREATE_PATH = '/settings/automations/agents/create';

const ClaimLinks = ({ claims }: { claims: TTriggerClaim[] }) => (
  <ul className="mt-1 flex flex-col gap-1">
    {claims.map(({ _id, name }) => (
      <li key={_id}>
        <Link
          to={`/automations/edit/${_id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline"
        >
          {name}
          <IconExternalLink className="size-3" />
        </Link>
      </li>
    ))}
  </ul>
);

export const FacebookBotAiReplyDialog = ({
  channel,
  botId,
  botName,
  onClose,
}: {
  channel: TAiReplyChannel | null;
  botId: string;
  botName?: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.facebook' });
  const {
    form,
    agents,
    agentsLoading,
    agentsError,
    activeConflicts,
    draftConflicts,
    claimsLoading,
    canSubmit,
    onSubmit,
  } = useFacebookBotAiReplyForm({
    channel,
    botId,
    botName,
    open: !!channel,
  });

  const isComment = channel === 'comment';
  const location = useLocation();
  // The current URL still carries `aiReply`, so going back reopens this dialog.
  const createAgentLink = `${AI_AGENT_CREATE_PATH}${automationReturnLinkSearch({
    path: `${location.pathname}${location.search}`,
    label: botName || 'Facebook bot',
  })}`;

  return (
    <Dialog
      open={!!channel}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
          onClose();
        }
      }}
    >
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>
            {isComment
              ? t('ai-comment-reply', { defaultValue: 'AI comment reply' })
              : t('ai-messenger-reply', { defaultValue: 'AI messenger reply' })}
          </Dialog.Title>
          <Dialog.Description>
            {isComment
              ? t('ai-comment-reply-description', {
                  defaultValue:
                    'The AI agent reads every comment on this bot’s posts and replies under it.',
                })
              : t('ai-messenger-reply-description', {
                  defaultValue:
                    'The AI agent reads every text message sent to this bot and replies in Messenger.',
                })}
          </Dialog.Description>
        </Dialog.Header>

        <Form {...form}>
          <form
            onSubmit={(event) => {
              // This dialog opens from inside the bot form.
              event.stopPropagation();
              onSubmit(event);
            }}
            className="flex flex-col gap-4"
          >
            <Form.Field
              control={form.control}
              name="aiAgentId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('ai-agent', { defaultValue: 'AI agent' })}
                  </Form.Label>
                  {agentsLoading && !agents.length ? (
                    <Skeleton className="h-8 w-full" />
                  ) : agents.length ? (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value
                            placeholder={t('choose-ai-agent', {
                              defaultValue: 'Choose an AI agent',
                            })}
                          />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {agents.map(({ _id, name }) => (
                          <Select.Item key={_id} value={_id}>
                            {name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {agentsError
                        ? agentsError.message
                        : t('no-ai-agents', {
                            defaultValue:
                              'No AI agent yet. Create one; you come back here afterwards.',
                          })}
                    </p>
                  )}
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Button
              type="button"
              variant="outline"
              className="self-start"
              asChild
            >
              <Link to={createAgentLink}>
                <IconPlus />
                {t('create-ai-agent', { defaultValue: 'Create AI agent' })}
              </Link>
            </Button>

            {activeConflicts.length > 0 && (
              <Alert variant="destructive">
                <IconAlertTriangle />
                <Alert.Title>
                  {t('ai-reply-conflict', {
                    defaultValue:
                      'Another active automation already answers everything on this bot',
                  })}
                </Alert.Title>
                <Alert.Description>
                  {t('ai-reply-conflict-description', {
                    defaultValue:
                      'Both would reply to the same person. Deactivate it or change its trigger first.',
                  })}
                  <ClaimLinks claims={activeConflicts} />
                </Alert.Description>
              </Alert>
            )}

            {draftConflicts.length > 0 && (
              <Alert>
                <IconAlertTriangle />
                <Alert.Title>
                  {t('ai-reply-draft-conflict', {
                    defaultValue:
                      'A draft automation answers everything on this bot too',
                  })}
                </Alert.Title>
                <Alert.Description>
                  {t('ai-reply-draft-conflict-description', {
                    defaultValue:
                      'It does not run while it is a draft, but activating both would reply twice.',
                  })}
                  <ClaimLinks claims={draftConflicts} />
                </Alert.Description>
              </Alert>
            )}

            <Dialog.Footer>
              {claimsLoading && <Spinner size="sm" />}
              <Button type="submit" disabled={!canSubmit || !agents.length}>
                {t('open-in-builder', { defaultValue: 'Open in builder' })}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
