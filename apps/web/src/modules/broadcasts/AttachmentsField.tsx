import { BROADCAST_ATTACHMENTS_MAX, BROADCAST_ATTACHMENTS_MAX_MB } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { skipToken, useQuery } from '@tanstack/react-query';
import { Button, Label, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadErrorMessage, uploadFile } from '~/lib/files';
import { AttachButton, AttachedFiles } from '~/modules/activity/NoteAttachments';

const MB = 1024 * 1024;

const sizeOf = (files: { size: number }[]) => files.reduce((sum, file) => sum + file.size, 0);

/** Uploads picked files within the limits and adds them to `value`. */
const useAttach = (
  value: string[],
  attached: { size: number }[],
  onChange: (attachmentIds: string[]) => void,
) => {
  const { t } = useTranslation('broadcasts');
  const { toast } = useToast();
  const [uploading, setUploading] = useState(0);

  const refuse = (title: string) => toast({ variant: 'destructive', title });

  const attach = async (picked: File[]) => {
    if (value.length + uploading + picked.length > BROADCAST_ATTACHMENTS_MAX) {
      refuse(
        t('attachments-max', 'Attach up to {{max}} files', { max: BROADCAST_ATTACHMENTS_MAX }),
      );

      return;
    }

    if (sizeOf(attached) + sizeOf(picked) > BROADCAST_ATTACHMENTS_MAX_MB * MB) {
      refuse(
        t('attachments-size', 'Attachments can be up to {{max}} MB together', {
          max: BROADCAST_ATTACHMENTS_MAX_MB,
        }),
      );

      return;
    }

    setUploading((count) => count + picked.length);

    const ids = await Promise.all(
      picked.map(async (file) => {
        try {
          return [(await uploadFile(file)).id];
        } catch (error) {
          toast({
            variant: 'destructive',
            title: file.name,
            description: uploadErrorMessage(error),
          });

          return [];
        } finally {
          setUploading((count) => count - 1);
        }
      }),
    );

    onChange([...value, ...ids.flat()]);
  };

  return { attach, uploading };
};

const DeletedNotice = ({ count, onRemove }: { count: number; onRemove: () => void }) => {
  const { t } = useTranslation('broadcasts');

  return (
    <p role="alert" className="flex items-center gap-2 text-xs text-destructive-text">
      {t('attachments-deleted', '{{count}} attached files were deleted', { count })}
      <Button variant="ghost" size="sm" onClick={onRemove}>
        {t('attachments-remove-deleted', 'Remove them')}
      </Button>
    </p>
  );
};

/** The files an email broadcast sends with every copy: uploaded as they are picked. */
export const AttachmentsField = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (attachmentIds: string[]) => void;
}) => {
  const { t } = useTranslation('broadcasts');

  const files = useQuery(
    orpc.files.list.queryOptions({
      input: value.length > 0 ? { ids: value.join(',') } : skipToken,
      select: (page) => page.data,
    }),
  );

  const attached = files.data ?? [];
  // Files the list no longer returns were deleted since they were attached.
  const deleted = files.isSuccess ? value.filter((id) => !attached.some((f) => f.id === id)) : [];
  const { attach, uploading } = useAttach(value, attached, onChange);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{t('attachments', 'Attachments')}</Label>
        <AttachButton onAttach={attach} />
      </div>
      {files.isError && (
        <p role="alert" className="text-xs text-destructive-text">
          {messageOf(files.error)}
        </p>
      )}
      {(attached.length > 0 || uploading > 0) && (
        <AttachedFiles
          files={attached}
          uploading={uploading}
          onRemove={(id) => onChange(value.filter((item) => item !== id))}
        />
      )}
      {deleted.length > 0 && (
        <DeletedNotice
          count={deleted.length}
          onRemove={() => onChange(value.filter((id) => !deleted.includes(id)))}
        />
      )}
      <p className="text-xs text-muted-foreground">
        {t('attachments-hint', 'Sent with every email: up to {{max}} files, {{mb}} MB together.', {
          max: BROADCAST_ATTACHMENTS_MAX,
          mb: BROADCAST_ATTACHMENTS_MAX_MB,
        })}
      </p>
    </div>
  );
};
