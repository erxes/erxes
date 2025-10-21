import { MetaFieldLine } from '@/automations/components/builder/nodes/components/MetaFieldLine';

export const IncomingWebhookNodeContent = ({ config }: any) => {
  const { endpoint, method } = config || {};
  return (
    <>
      <MetaFieldLine fieldName="Url" content={`${endpoint} - ${method}`} />
    </>
  );
};
