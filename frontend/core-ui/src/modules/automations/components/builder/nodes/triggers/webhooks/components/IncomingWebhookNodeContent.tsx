import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const IncomingWebhookNodeContent = ({ config }: any) => {
  const { t } = useTranslation('automations');
  const { endpoint, method } = config || {};
  return (
    <>
      <AutomationNodeMetaInfoRow
        fieldName={t('webhook-trigger-url-field')}
        content={`${endpoint} - ${method}`}
      />
    </>
  );
};
