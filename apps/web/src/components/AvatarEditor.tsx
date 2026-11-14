import { IconCamera, IconTrash } from '@tabler/icons-react';
import { Avatar, Button, cn, Popover, readImage, Upload } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** An upload's address once stored: previews (`data:`, `blob:`) are never saved. */
const storedUrl = (value: { url?: string } | null | undefined) => {
  const url = value?.url ?? '';

  return /^(data|blob):/.test(url) ? undefined : url;
};

/** The picture and its upload controls: preview (click to choose a file), Upload, Remove. */
const AvatarUpload = ({
  value,
  onChange,
  compact,
}: {
  value: string;
  onChange: (url: string | null) => void;
  /** One form row high (32px) instead of the 64px preview. */
  compact?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'avatar' });
  // In a form row the buttons match the row's 28px inputs.
  const buttonSize = compact ? 'default' : 'sm';

  return (
    <Upload.Root
      // Its own preview of the last upload is dropped when the saved picture changes (removed, replaced).
      key={value || 'none'}
      value={value}
      onChange={(next) => {
        const url = storedUrl('url' in next ? next : null);

        if (url !== undefined) onChange(url || null);
      }}
      className="items-center"
    >
      <Upload.Preview variant="avatar" size={compact ? 'sm' : 'default'} />
      <div className={cn('flex gap-1.5', compact ? 'items-center' : 'flex-col')}>
        <Upload.Button size={buttonSize} variant="outline" type="button" />
        {/* Clears the picture; the stored file stays (erxes-ui's remove button would delete it by name). */}
        {value && (
          <Button
            size={buttonSize}
            variant="ghost"
            type="button"
            tone="muted"
            onClick={() => onChange(null)}
          >
            <IconTrash />
            {t('remove', 'Remove')}
          </Button>
        )}
      </div>
    </Upload.Root>
  );
};

/**
 * A record's picture in its header (customer, company, team member), as erxes
 * does: who may edit it clicks it — a camera shows on hover — and uploads,
 * changes or removes the picture; saved as soon as the upload is stored.
 */
export const AvatarEditor = ({
  src,
  name,
  onSave,
  canEdit = true,
  className,
}: {
  src?: string | null;
  name?: string;
  onSave: (url: string | null) => void;
  canEdit?: boolean;
  className?: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'avatar' });

  const picture = (
    <>
      <Avatar.Image src={readImage(src ?? undefined)} />
      <Avatar.Fallback>{name?.charAt(0)}</Avatar.Fallback>
    </>
  );

  if (!canEdit) {
    return (
      <Avatar size="lg" className={cn('size-7 flex-none', className)}>
        {picture}
      </Avatar>
    );
  }

  // The avatar is the trigger, so the focus ring follows its round edge.
  return (
    <Popover>
      <Popover.Trigger
        nativeButton={false}
        render={<Avatar size="lg" className={cn('group size-7 flex-none', className)} />}
        aria-label={t('change', 'Change picture')}
        title={t('change', 'Change picture')}
      >
        {picture}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-data-popup-open:opacity-100">
          <IconCamera className="size-3.5" />
        </span>
      </Popover.Trigger>
      <Popover.Content align="start" sideOffset={8} className="w-64">
        <div className="space-y-3">
          <p className="text-sm font-medium">{t('title', 'Picture')}</p>
          <AvatarUpload value={src ?? ''} onChange={onSave} />
        </div>
      </Popover.Content>
    </Popover>
  );
};

/** The same controls as a form field (the add forms), saved with the form. */
export const AvatarUploadField = ({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) => <AvatarUpload value={value ?? ''} onChange={onChange} compact />;
