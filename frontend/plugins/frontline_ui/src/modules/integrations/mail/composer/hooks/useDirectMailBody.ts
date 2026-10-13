import {
  serializeNoteBlocks,
  trimEmptyBlocks,
} from '@/activity/utils/noteBlocks';
import { useDirectMailComposerStateContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerStateContext';
import type { ComposerAttachment } from '@/integrations/mail/composer/types/directMailComposer';
import type { Block } from '@blocknote/core';

export const useDirectMailBody = (): (() => void) => {
  const { editor, form, setAttachments } = useDirectMailComposerStateContext();
  const { setValue } = form;
  const handleBodyChange = () => {
    const fileBlocks: typeof editor.document = [];
    const collectFiles = (blocks: typeof editor.document) => {
      for (const block of blocks) {
        if (block.type === 'file' && block.props.url) fileBlocks.push(block);
        collectFiles(block.children);
      }
    };
    collectFiles(editor.document);
    if (fileBlocks.length) {
      // Let the file panel finish updating both the URL and filename first.
      queueMicrotask(() => {
        const completedBlocks: typeof editor.document = [];
        const uploadedAttachments: ComposerAttachment[] = [];
        for (const { id } of fileBlocks) {
          const block = editor.getBlock(id);
          if (block?.type !== 'file' || !block.props.url) continue;
          completedBlocks.push(block);
          uploadedAttachments.push({
            id: block.id,
            name: block.props.name || 'Attachment',
            url: block.props.url,
            disposition: 'attachment',
          });
        }
        if (!completedBlocks.length) return;
        editor.filePanel?.closeMenu();
        setAttachments((current) => {
          const existingUrls = new Set(current.map(({ url }) => url));
          return [
            ...current,
            ...uploadedAttachments.filter(({ url }) => !existingUrls.has(url)),
          ];
        });
        editor.removeBlocks(completedBlocks);
        editor.focus();
      });
    }
    setValue(
      'body',
      serializeNoteBlocks(trimEmptyBlocks(editor.document as Block[])),
      {
        shouldDirty: true,
        shouldValidate: form.formState.isSubmitted,
      },
    );
  };

  return handleBodyChange;
};
