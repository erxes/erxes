import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import type { DirectMailTemplateSelectorState } from '@/integrations/mail/composer/types/directMailTemplateSelector';
import { useEffect, useRef } from 'react';
import { useRenderEmailTemplate } from 'ui-modules';
import type { EmailTemplate } from 'ui-modules';

export const useDirectMailTemplateSelector =
  (): DirectMailTemplateSelectorState => {
    const { editor, target, sending, failedDelivery } =
      useDirectMailComposerContext();
    const renderTemplate = useRenderEmailTemplate();
    const generation = useRef(0);
    useEffect(
      () => () => {
        generation.current += 1;
      },
      [editor, target, sending, failedDelivery],
    );
    const disabled = sending || Boolean(failedDelivery);
    const selectTemplate = async (template: EmailTemplate): Promise<void> => {
      const requestGeneration = generation.current;
      const blocks = await editor.tryParseHTMLToBlocks(
        await renderTemplate(template),
      );
      if (requestGeneration !== generation.current) return;
      editor.insertBlocks(
        blocks,
        editor.getTextCursorPosition().block,
        'after',
      );
      editor.focus();
    };

    return { disabled, selectTemplate };
  };
