import { toast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const COPIED_FEEDBACK_MS = 1500;

/** Copies a variable placeholder, for inputs where dropping one does not work. */
export const useCopyVariableToken = (token: string) => {
  const { t } = useTranslation('automations');
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(
        () => setCopied(false),
        COPIED_FEEDBACK_MS,
      );
    } catch (error) {
      toast({
        title: t('copy-variable-failed'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    }
  };

  return { copied, copy };
};
