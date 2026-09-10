import { ActionResult, AutomationExecutionActionResultProps } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { FacebookSentMessageStep } from '~/widgets/automations/modules/facebook/components/history/FacebookSentMessageStep';
import { useFacebookAutomationHistoryResult } from '~/widgets/automations/modules/facebook/components/history/useFacebookAutomationHistoryResult';

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
    isDropped,
    isQueued,
    isSkipped,
    sendAfterMs,
    isWaiting,
    messages,
    skipReason,
  } = useFacebookAutomationHistoryResult(action, result);

  if (hasError) {
    return (
      <>
        <ActionResult.Status status="error">
          {typeof error === 'string' ? error : t('error')}
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

  if (isDropped) {
    return (
      <>
        <ActionResult.Status status="dropped">
          {t('comment-no-result', {
            defaultValue:
              'No result came back within the hour, so the automation stopped waiting. The bot\u2019s Activity tab says whether the reply went out.',
          })}
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
        {skipReason === 'queue-expired' &&
          t('comment-queue-expired', {
            defaultValue:
              'Skipped: public replies stayed paused for a day, so this one was dropped. The private reply still went out.',
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
        <ActionResult.Status>{t('sent-successfully')}</ActionResult.Status>
        <ActionResult.Fields>
          <ActionResult.Field label={t('reply')} value={commentText} />
          <ActionResult.Field
            label={t('attachments')}
            value={commentAttachments.map(({ url }) => url).join(', ')}
          />
        </ActionResult.Fields>
      </>
    );
  }

  if (!messages.length) {
    return <ActionResult.Status>{t('sent-successfully')}</ActionResult.Status>;
  }

  return (
    <>
      <ActionResult.Status status={isWaiting ? 'waiting' : 'success'}>
        {t('messages-sent', { count: messages.length })}
      </ActionResult.Status>

      <ol className="min-w-0 space-y-2">
        {messages.map((message) => (
          <FacebookSentMessageStep key={message.key} message={message} />
        ))}
      </ol>
    </>
  );
};
