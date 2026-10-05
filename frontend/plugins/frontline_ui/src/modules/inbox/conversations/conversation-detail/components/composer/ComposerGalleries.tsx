import { ComposerGallery } from './ComposerGallery';
import { useComposerGalleries } from '../../hooks/composer/useComposerGallery';
import type { ComposerGalleriesProps } from '../../types/composer';

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
