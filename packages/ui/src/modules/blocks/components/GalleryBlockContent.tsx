import { useRef } from 'react';
import { AttachmentPreview } from 'erxes-ui/modules/attachments/attachment-media';
import type { GalleryRenderProps } from 'erxes-ui/modules/blocks/constant/galleryBlockConfig';
import { useGalleryUpload } from 'erxes-ui/modules/blocks/hooks/useGalleryUpload';
import {
  keyGalleryImages,
  parseGalleryColumns,
  parseGalleryImages,
} from 'erxes-ui/modules/blocks/utils/galleryImages';
import {
  GalleryColumnPicker,
  GalleryItem,
  GalleryNoUploadHandler,
  GalleryUploadButton,
} from './GalleryBlockParts';

// Upload and column controls under an editable gallery.
const GalleryEditBar = ({
  block,
  editor,
  isEmpty,
  columns,
}: GalleryRenderProps & { isEmpty: boolean; columns: number }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { uploading, upload } = useGalleryUpload({
    uploadFile: editor.uploadFile,
    onUploaded: (uploaded) => {
      // Read the block again: it may have changed while the files uploaded.
      const currentBlock = editor.getBlock(block.id);

      if (!currentBlock) return;

      editor.updateBlock(block, {
        props: {
          images: JSON.stringify([...parseGalleryImages(currentBlock.props.images), ...uploaded]),
        },
      });
    },
  });

  const handleFiles = async (files: FileList | null) => {
    await upload(files);

    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {editor.uploadFile ? (
        <GalleryUploadButton
          uploading={uploading}
          empty={isEmpty}
          onClick={() => inputRef.current?.click()}
        />
      ) : (
        isEmpty && <GalleryNoUploadHandler />
      )}

      {!isEmpty && (
        <GalleryColumnPicker
          columns={columns}
          onChange={(n) => editor.updateBlock(block, { props: { columns: String(n) } })}
        />
      )}
    </div>
  );
};

export const GalleryBlockContent = (props: GalleryRenderProps) => {
  const { block, editor } = props;
  const keyedImages = keyGalleryImages(parseGalleryImages(block.props.images));
  const columns = parseGalleryColumns(block.props.columns);
  const readonly = !editor.isEditable;
  const isEmpty = keyedImages.length === 0;

  const removeImage = (key: string) => {
    const images = keyedImages.flatMap((keyed) => (keyed.key === key ? [] : [keyed.image]));

    editor.updateBlock(block, { props: { images: JSON.stringify(images) } });
  };

  if (readonly && isEmpty) return null;

  return (
    <div className="w-full my-1 select-none" contentEditable={false}>
      {!isEmpty && (
        <AttachmentPreview
          images={keyedImages.map(({ image }) => ({
            url: image.url,
            name: image.caption ?? '',
          }))}
          renderThumbnails={(openPreview) => (
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {keyedImages.map(({ image, key }, index) => (
                <GalleryItem
                  key={key}
                  image={image}
                  readonly={readonly}
                  onRemove={() => removeImage(key)}
                  onPreview={() => openPreview(index)}
                />
              ))}
            </div>
          )}
        />
      )}

      {!readonly && <GalleryEditBar {...props} isEmpty={isEmpty} columns={columns} />}
    </div>
  );
};
