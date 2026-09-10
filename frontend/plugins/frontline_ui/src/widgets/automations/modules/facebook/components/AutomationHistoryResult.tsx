import { ActionResult, AutomationExecutionActionResultProps } from 'ui-modules';

import { FacebookSentMessageStep } from '~/widgets/automations/modules/facebook/components/history/FacebookSentMessageStep';
import { useFacebookAutomationHistoryResult } from '~/widgets/automations/modules/facebook/components/history/useFacebookAutomationHistoryResult';
import { useTranslation } from 'react-i18next';

export const AutomationHistoryResult = ({
  action,
  result,
}: AutomationExecutionActionResultProps) => {
  const { t } = useTranslation('frontline');
  const {
    blockedUntil,
    commentAttachments,
    commentText,
    error,
    hasError,
    isCommentReply,
    isQueued,
    isSkipped,
    sendAfterMs,
    isWaiting,
    messages,
    skipLimit,
    skipReason,
  } = useFacebookAutomationHistoryResult(action, result);

  if (hasError) {
    return (
      <>
        <ActionResult.Status status="error">
          {typeof error === 'string' ? error : t('error', 'Error')}
        </ActionResult.Status>
        {blockedUntil && (
          <ActionResult.Fields>
            <ActionResult.Field
              label={t('public-replies-paused', {
                defaultValue: 'Public replies paused until',
              })}
              value={new Date(blockedUntil).toLocaleString()}
            />
          </ActionResult.Fields>
        )}
      </>
    );
  }

  if (isQueued) {
    return (
      <>
        <ActionResult.Status status="queued">
          {sendAfterMs
            ? t('comment-queued-in', {
                defaultValue: 'Queued — sending in about {{minutes}} min',
                minutes: Math.round(sendAfterMs / 60000),
              })
            : t('comment-queued', { defaultValue: 'Queued — sending shortly' })}
        </ActionResult.Status>
        <ActionResult.Fields>
          <ActionResult.Field label={t('reply')} value={commentText} />
        </ActionResult.Fields>
      </>
    );
  }

  if (isSkipped) {
    return (
      <ActionResult.Status status="dropped">
        {skipReason === 'post-public-reply-limit' &&
          t('comment-post-limit-reached', {
            defaultValue:
              'Skipped: this post already received {{limit}} public replies. The private reply still went out.',
            limit: skipLimit,
          })}
        {skipReason === 'send-blocked' &&
          t('comment-send-blocked', {
            defaultValue:
              'Skipped: Facebook refused a public reply on this page, so they are paused until {{until}}. The private reply still went out.',
            until: blockedUntil ? new Date(blockedUntil).toLocaleString() : '—',
          })}
        {!skipReason && t('skipped', { defaultValue: 'Skipped' })}
      </ActionResult.Status>
    );
  }

  if (isCommentReply) {
    return (
      <>
        <ActionResult.Status>
          {t('sent-successfully', 'Sent successfully')}
        </ActionResult.Status>
        <ActionResult.Fields>
          <ActionResult.Field label={t('reply', 'Reply')} value={commentText} />
          <ActionResult.Field
            label={t('attachments', 'Attachments')}
            value={commentAttachments.map(({ url }) => url).join(', ')}
          />
        </ActionResult.Fields>
      </>
    );
  }

  if (!messages.length) {
    return (
      <ActionResult.Status>
        {t('sent-successfully', 'Sent successfully')}
      </ActionResult.Status>
    );
  }

  return (
    <>
      <ActionResult.Status status={isWaiting ? 'waiting' : 'success'}>
        {t('messages-sent', '{{count}} message sent', {
          count: messages.length,
        })}
      </ActionResult.Status>

      <ol className="min-w-0 space-y-2">
        {messages.map((message) => (
          <FacebookSentMessageStep key={message.key} message={message} />
        ))}
      </ol>
    </>
  );
};
