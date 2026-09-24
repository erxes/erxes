import { JSONContent } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';

const hasContent = (node?: JSONContent): boolean => {
  if (!node) {
    return false;
  }

  if (node.text?.trim()) {
    return true;
  }

  // A block with no text of its own still counts: an image or a button is the
  // email as much as a sentence is.
  if (node.type && !['doc', 'paragraph', 'text'].includes(node.type)) {
    return true;
  }

  return (node.content || []).some(hasContent);
};

/**
 * What a test send or a preview needs before it can say anything true: an
 * address the email would come from, and an email to put in it. A send needs
 * a subject as well, which a preview does not.
 */
export const useBroadcastEmailReadiness = ({
  requireSubject = false,
}: { requireSubject?: boolean } = {}) => {
  const { control } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { alignedFrom, loading } = useSenderOptions();

  const [fromEmail, contentJson, subject] = useWatch({
    control,
    name: ['fromEmail', 'email.contentJson', 'email.subject'],
  });

  const from = alignedFrom || fromEmail;

  const blockers = [
    !from && t('blockedNoSender'),
    !hasContent(contentJson) && t('blockedNoContent'),
    // A preview needs no subject; anything that actually leaves does.
    requireSubject && !String(subject || '').trim() && t('blockedNoSubject'),
  ].filter(Boolean) as string[];

  return { from, blockers, ready: !blockers.length, loading };
};
