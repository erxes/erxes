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
    commentAttachments,
    commentText,
    error,
    hasError,
    isCommentReply,
    isWaiting,
    messages,
  } = useFacebookAutomationHistoryResult(action, result);

  if (hasError) {
    return (
      <ActionResult.Status status="error">
        {typeof error === 'string' ? error : t('error')}
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
