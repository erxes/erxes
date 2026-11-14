import {
  IconAlertTriangle,
  IconFileText,
  IconPaperclip,
  IconPointer,
  IconX,
} from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import { ATTACH_ACCEPT, sizeLabel, typeLabel } from './attachments';
import type { Attachments, Upload } from './useAttachments';
import type { PagePicker, Picked, PickTarget } from './usePagePicker';

const TILE =
  'flex h-11 max-w-48 min-w-0 items-center gap-2 rounded-lg border bg-background p-1 pr-0.5';

const Thumb = ({ src }: { src: string | null }) =>
  src ? (
    <img src={src} alt="" className="size-9 shrink-0 rounded-md border object-cover" />
  ) : (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent">
      <IconFileText aria-hidden className="size-4 text-muted-foreground" />
    </span>
  );

const RemoveButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <IconTip label={label}>
    <Button variant="ghost" size="icon" tone="muted" aria-label={label} onClick={onClick}>
      <IconX className="size-3.5" />
    </Button>
  </IconTip>
);

const UploadStatus = ({ item }: { item: Upload }) => {
  const { t } = useTranslation('assistant');

  switch (item.status) {
    case 'uploading':
      return <>{t('attach.uploading', 'Uploading {{progress}}%', { progress: item.progress })}</>;
    case 'failed':
      return <span className="text-destructive-text">{item.error}</span>;
    case 'ready':
      return <>{`${typeLabel(item)} · ${sizeLabel(item.size)}`}</>;
  }
};

const UploadTile = ({ item, onRemove }: { item: Upload; onRemove: () => void }) => {
  const { t } = useTranslation('assistant');

  return (
    <li className={TILE} title={item.status === 'failed' ? item.error : item.name}>
      {item.status === 'failed' ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent">
          <IconAlertTriangle aria-hidden className="size-4 text-destructive-text" />
        </span>
      ) : (
        <Thumb src={item.preview} />
      )}
      <span className="flex min-w-0 flex-1 flex-col text-xs">
        <span className="truncate font-medium">{item.name}</span>
        <span className="truncate text-muted-foreground">
          <UploadStatus item={item} />
        </span>
      </span>
      <RemoveButton
        label={t('attach.remove', 'Remove {{name}}', { name: item.name })}
        onClick={onRemove}
      />
    </li>
  );
};

const PickedTile = ({ item, onRemove }: { item: Picked; onRemove: () => void }) => {
  const { t } = useTranslation('assistant');

  return (
    <li className={TILE} title={item.title}>
      {item.selection ? (
        <Thumb src={item.preview} />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center">
          <Spinner />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col text-xs">
        <span className="truncate font-medium">{item.title}</span>
        <span className="truncate text-muted-foreground">{t('select.kind', 'Page selection')}</span>
      </span>
      <RemoveButton
        label={t('attach.remove', 'Remove {{name}}', { name: item.title })}
        onClick={onRemove}
      />
    </li>
  );
};

export const AttachmentTray = ({
  attachments,
  picker,
}: {
  attachments: Attachments;
  picker: PagePicker;
}) => {
  const { t } = useTranslation('assistant');

  if (!attachments.items.length && !picker.items.length) return null;

  return (
    <ul aria-label={t('attach.tray', 'To send')} className="flex flex-wrap gap-1.5">
      {attachments.items.map((item) => (
        <UploadTile key={item.key} item={item} onRemove={() => attachments.remove(item.key)} />
      ))}
      {picker.items.map((item) => (
        <PickedTile key={item.key} item={item} onRemove={() => picker.remove(item.key)} />
      ))}
    </ul>
  );
};

export const AttachButton = ({
  attachments,
  disabled,
}: {
  attachments: Attachments;
  disabled: boolean;
}) => {
  const { t } = useTranslation('assistant');
  const input = useRef<HTMLInputElement>(null);
  const label = t('attach.files', 'Attach files');

  return (
    <>
      <input
        ref={input}
        type="file"
        multiple
        hidden
        accept={ATTACH_ACCEPT}
        aria-label={label}
        onChange={(event) => {
          attachments.add([...(event.target.files ?? [])]);
          event.target.value = '';
        }}
      />
      <IconTip label={label}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tone="muted"
          aria-label={label}
          disabled={disabled || attachments.full}
          onClick={() => input.current?.click()}
        >
          <IconPaperclip className="size-4" />
        </Button>
      </IconTip>
    </>
  );
};

export const PickButton = ({ picker, disabled }: { picker: PagePicker; disabled: boolean }) => {
  const { t } = useTranslation('assistant');
  const label = t('select.start', 'Select part of the page');

  return (
    <IconTip label={label}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        tone="muted"
        aria-label={label}
        aria-pressed={picker.picking}
        disabled={disabled || picker.full}
        onClick={picker.picking ? picker.cancel : picker.start}
      >
        <IconPointer className="size-4" />
      </Button>
    </IconTip>
  );
};

const Highlight = ({ target }: { target: PickTarget }) =>
  createPortal(
    <div
      aria-hidden
      style={{
        '--pick-top': `${target.top}px`,
        '--pick-left': `${target.left}px`,
        '--pick-width': `${target.width}px`,
        '--pick-height': `${target.height}px`,
      }}
      className="pointer-events-none fixed top-(--pick-top) left-(--pick-left) z-50 h-(--pick-height) w-(--pick-width) rounded-sm border-2 border-primary bg-primary/10"
    />,
    document.body,
  );

export const PickHint = ({ picker }: { picker: PagePicker }) => {
  const { t } = useTranslation('assistant');

  if (!picker.picking) return null;

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-accent px-2 py-1 text-xs">
      <output>{t('select.hint', 'Click a part of the page to select it. Esc cancels.')}</output>
      <Button type="button" variant="ghost" size="sm" onClick={picker.cancel}>
        {t('select.cancel', 'Cancel')}
      </Button>
      {picker.target && <Highlight target={picker.target} />}
    </div>
  );
};
