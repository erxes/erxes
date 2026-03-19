import { readImage } from 'erxes-ui';
import { IconUpload, IconTrash, IconGripVertical } from '@tabler/icons-react';
import { useImageUpload } from '../hooks';

interface ImageUploadGridProps {
  value?: string[];
  onChange: (value: string[]) => void;
  maxImages?: number;
  maxFileSize?: number;
}

export const ImageUploadGrid = ({
  value,
  onChange,
  maxImages = 10,
  maxFileSize = 20 * 1024 * 1024,
}: ImageUploadGridProps) => {
  const { urls, uploadProps, loading, handleRemove, handleDrag } =
    useImageUpload({
      value,
      onChange,
      maxImages,
      maxFileSize,
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4">
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('index', String(index))}
            onDrop={(e) => {
              const from = Number(e.dataTransfer.getData('index'));
              handleDrag(from, index);
            }}
            onDragOver={(e) => e.preventDefault()}
            className="overflow-hidden relative w-24 rounded-md border shadow-sm cursor-move aspect-square bg-muted group"
          >
            <img
              src={readImage(url)}
              alt="Preview"
              loading="lazy"
              className="object-cover w-full h-full"
            />

            <div className="flex absolute inset-0 justify-center items-center transition bg-black/0 group-hover:bg-black/30">
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="p-1 text-white rounded-md shadow opacity-0 transition group-hover:opacity-100 bg-destructive"
              >
                <IconTrash size={14} />
              </button>
            </div>

            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100">
              <IconGripVertical size={14} className="text-white" />
            </div>
          </div>
        ))}

        {urls.length < maxImages && (
          <div
            className="flex flex-col justify-center items-center w-24 rounded-md border border-dashed transition cursor-pointer aspect-square text-muted-foreground bg-background hover:bg-accent"
            onClick={uploadProps.open}
          >
            {loading ? (
              <span className="text-xs">Uploading...</span>
            ) : (
              <>
                <IconUpload size={18} />
                <span className="text-[11px]">Add images</span>
              </>
            )}
          </div>
        )}
      </div>

      {urls.length >= maxImages && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxImages} images allowed
        </p>
      )}

      <input {...uploadProps.getInputProps()} />
    </div>
  );
};
