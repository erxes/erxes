import { useSendEmailContentEditor } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailContentEditor';
import { useSendEmailMailyHtml } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailMailyHtml';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { JSONContent, useConfirm } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type TEmailFormat = 'maily' | 'blocks';

/**
 * An action that already carries block content keeps the editor it was
 * written in; a new one is written in the email editor.
 */
const formatOf = (
  stored: TEmailFormat | undefined,
  contentJson: unknown,
  content: string,
): TEmailFormat => stored || (contentJson || !content ? 'maily' : 'blocks');

/** Which editor writes the email, and switching between the two. */
export const useSendEmailEmailContentBuilder = (content: string) => {
  const { t } = useTranslation('automations');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { watch, setValue } = useFormContext<TAutomationSendEmailConfig>();
  const { confirm } = useConfirm();
  const contentJson = watch('contentJson');
  const format = formatOf(watch('contentFormat'), contentJson, content);

  const editor = useSendEmailContentEditor(format === 'blocks' ? content : '');
  useSendEmailMailyHtml(format === 'maily' ? contentJson : undefined, setValue);

  const handleContentJsonChange = useCallback(
    (value: JSONContent) => {
      setValue('contentJson', value, { shouldDirty: true });
      setValue('contentFormat', 'maily', { shouldDirty: true });
    },
    [setValue],
  );

  // The two editors store different things, so switching starts over
  const switchEditor = useCallback(() => {
    const apply = () => {
      setValue('contentFormat', format === 'maily' ? 'blocks' : 'maily', {
        shouldDirty: true,
      });
      setValue('contentJson', undefined, { shouldDirty: true });
      setValue('content', '', { shouldDirty: true });
      setValue('html', '', { shouldDirty: true });
    };

    if (!content.trim() && !contentJson) {
      apply();
      return;
    }

    confirm({ message: t('send-email-switch-editor-confirm') }).then(apply);
  }, [format, content, contentJson, confirm, setValue, t]);

  return {
    format,
    contentJson,
    editor,
    isSheetOpen,
    setIsSheetOpen,
    openSheet: () => setIsSheetOpen(true),
    switchLabelKey:
      format === 'maily'
        ? 'send-email-use-block-editor'
        : 'send-email-use-email-editor',
    handleContentJsonChange,
    switchEditor,
  };
};
