import { useTranslation } from 'react-i18next';
import { AutomationActionNodeConfigProps } from 'ui-modules';
import { ActionMessageConfigContent } from '~/widgets/automations/modules/facebook/components/action/components/replyMessage/ActionMessageConfigContent';
import { TMessageActionForm } from '~/widgets/automations/modules/facebook/components/action/states/replyMessageActionForm';

export const InboxMessageActionConfig = (
  props: AutomationActionNodeConfigProps<TMessageActionForm>,
) => {
  const { t } = useTranslation('frontline');
  const { messages = [] } = props.config || {};

  if (!messages.length) {
    return (
      <p className="text-xs text-muted-foreground italic">
        {t('no-message-configured')}
      </p>
    );
  }

  return <ActionMessageConfigContent {...props} />;
};
