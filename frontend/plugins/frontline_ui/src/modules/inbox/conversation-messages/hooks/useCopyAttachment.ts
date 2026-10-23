import { useEffect, useRef, useState } from 'react';
import { toast } from 'erxes-ui';
import type { IAttachment } from 'erxes-ui';
import { copyAttachment } from '@/inbox/conversation-messages/utils/copyAttachment';
import { useTranslation } from 'react-i18next';

export const useCopyAttachment = (
  attachment: IAttachment,
): {
  copied: boolean;
  copying: boolean;
  copy: () => Promise<void>;
} => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.inbox' });
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    setCopying(true);
    setCopied(false);
    clearTimeout(timer.current);
    try {
      await copyAttachment(attachment);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      toast({
        title: t('could-not-copy-attachment'),
        description:
          error instanceof Error ? error.message : t('please-try-again'),
        variant: 'destructive',
      });
    } finally {
      setCopying(false);
    }
  };
  return { copied, copying, copy };
};
