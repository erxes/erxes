import type { Editor as TiptapEditor } from '@tiptap/core';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/** The email body editor: its instance once mounted, and its required rule. */
export const useBroadcastEmailComposer = () => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [editor, setEditor] = useState<TiptapEditor>();

  return {
    control,
    editor,
    setEditor,
    hasError: !!(errors?.email as { contentJson?: unknown })?.contentJson,
    contentRules: { required: t('content-required') },
  };
};
