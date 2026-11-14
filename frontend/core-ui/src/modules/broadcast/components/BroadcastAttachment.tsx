import { IconX } from '@tabler/icons-react';
import {
  Button,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  formatBytes,
  getFileIcon,
  readImage,
} from 'erxes-ui';
import {
  isImageAttachment,
  useBroadcastAttachment,
} from '@/broadcast/hooks/useBroadcastAttachment';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

export const BroadcastAttachment = ({
  value,
  onChange,
}: ControllerRenderProps<FieldValues, 'email.attachments'>) => {
  const { files, uploadProps, removing, remove } = useBroadcastAttachment(
    value,
    onChange,
  );

  return (
    <div className="h-full overflow-y-auto space-y-2 rounded">
      {files.map((attachment) => (
        <div
          key={attachment.url}
          className="relative w-full h-12 rounded border bg-muted overflow-hidden flex items-center gap-2"
        >
          {isImageAttachment(attachment) ? (
            <div className="h-12 w-12 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
              <img
                src={readImage(attachment.url)}
                alt={attachment.name}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 shrink-0 rounded border bg-white flex items-center justify-center">
              {getFileIcon(attachment.type, attachment.name)}
            </div>
          )}

          <div className="shrink grow flex flex-col items-start truncate">
            <p title={attachment.name} className="text-sm truncate max-w-full">
              {attachment.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(attachment.size, 2)}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-full w-12 shrink-0"
            disabled={removing}
            onClick={() => remove(attachment.name)}
          >
            <IconX size={10} />
          </Button>
        </div>
      ))}
      <Dropzone {...uploadProps} className="mb-30">
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
    </div>
  );
};
