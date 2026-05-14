import { AutomationNodeMetaInfoRow } from 'ui-modules';

export const IncomingWebhookNodeContent = ({ config }: any) => {
  const { endpoint, method } = config || {};
  return (
    <>
      <AutomationNodeMetaInfoRow
        fieldName="Url"
        content={`${endpoint} - ${method}`}
      />
    </>
  );
};
