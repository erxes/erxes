import { Alert } from 'erxes-ui';
import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
export { ComposerAttachments } from '@/integrations/mail/composer/components/DirectMailComposerAttachments';

export const ComposerStatus = () => {
  const { failedDelivery } = useDirectMailComposerContext();
  return failedDelivery ? (
    <Alert
      variant="destructive"
      className="rounded-none border-0 bg-transparent px-4 py-3 text-sm"
    >
      <Alert.Description>
        {failedDelivery.deliveryError || 'Email was not delivered.'}
        {' Retry sending, or close this draft to start a new email.'}
      </Alert.Description>
    </Alert>
  ) : null;
};
