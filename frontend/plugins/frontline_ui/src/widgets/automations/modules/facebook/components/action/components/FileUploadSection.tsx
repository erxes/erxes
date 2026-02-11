import {
  IconCopy,
  IconPhotoScan,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import { Avatar, Button, cn, Dialog, Label } from 'erxes-ui';
import { useFbBotFileUploadSection } from '../hooks/useFbBotFileUploadSection';

type FileUploadSectionProps = {
  onUpload?: (file: string | null) => void;
  limit?: number; // in MB, default 25MB
  url?: string; // Optional URL prop
  mimeType?: string;
};

export const FileUploadSection = ({
  onUpload,
  limit = 25,
  url: urlProp,
  mimeType = 'image/*',
}: FileUploadSectionProps) => {
  const {
    uploadedFileUrl,
    isImageType,
    isDragOver,
    FileIcon,
    label,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleClear,
    handleCopyUrl,
    isLoading,
  } = useFbBotFileUploadSection({ url: urlProp, mimeType, limit, onUpload });

  if (uploadedFileUrl) {
    return (
      <div className="w-full rounded-lg border border-border p-3 flex items-center gap-3">
        <div className="flex-shrink-0">
          {isImageType ? (
            <Dialog>
              <Dialog.Trigger asChild>
                <img
                  src={uploadedFileUrl}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </Dialog.Trigger>
              <Dialog.Content>
                <img src={uploadedFileUrl} alt="Uploaded image" />
              </Dialog.Content>
            </Dialog>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
              <FileIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{`${label} uploaded`}</p>
            <p className="text-xs text-muted-foreground truncate">
              {uploadedFileUrl.length > 50
                ? `${uploadedFileUrl.substring(0, 50)}...`
                : uploadedFileUrl}
            </p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyUrl}
              className="size-8"
            >
              <IconCopy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="size-8 text-destructive hover:text-destructive"
            >
              <IconTrash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full h-36 rounded-lg flex flex-col gap-2 items-center justify-center border-2 border-dashed transition-colors duration-200 cursor-pointer',
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload-input"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
      <label
        htmlFor="file-upload-input"
        className="flex flex-col gap-2 items-center justify-center cursor-pointer w-full h-full"
      >
        {isLoading ? (
          <div className="flex flex-col gap-2 items-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <Label className="text-sm text-muted-foreground">
              Uploading...
            </Label>
          </div>
        ) : (
          <>
            <IconPhotoScan className="w-24 h-24 text-accent-foreground" />
            <Label>
              Drag and Drop, choose from your Media library or upload
            </Label>
          </>
        )}
      </label>
    </div>
  );
};

export const QuickReplyImageUploader = ({
  image_url,
  onUpload,
}: {
  image_url: string;
  onUpload: (image_url: string | null) => void;
}) => {
  return (
    <div className="p-2 mr-2 rounded-full border border-dashed ">
      <Avatar>
        <Avatar.Image src={image_url} />
        <Avatar.Fallback>
          <IconUpload />
        </Avatar.Fallback>
      </Avatar>
    </div>
  );
};
