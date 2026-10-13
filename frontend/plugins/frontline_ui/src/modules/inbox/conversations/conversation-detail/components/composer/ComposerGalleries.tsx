import { ComposerGallery } from '@/inbox/conversations/conversation-detail/components/composer/ComposerGallery';
import { useComposerGalleries } from '@/inbox/conversations/conversation-detail/hooks/composer/useComposerGallery';
import type { ComposerGalleriesProps } from '@/inbox/conversations/conversation-detail/types/composer';

export const ComposerGalleries = ({
  editor,
  disabled,
  onUploadingChange,
}: ComposerGalleriesProps) => {
  const galleries = useComposerGalleries(editor);

  if (!galleries.length) return null;

  return (
    <>
      {galleries.map((block) => (
        <ComposerGallery
          key={block.id}
          block={block}
          editor={editor}
          disabled={disabled}
          onUploadingChange={onUploadingChange}
        />
      ))}
    </>
  );
};
