import { Button, Popover, Upload } from 'erxes-ui';
import { IconPhoto } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelField } from 'ui-modules';

// Local previews (data:, blob:) are not saved; only the uploaded file is.
const isStoredUrl = (url: string) =>
  !url.startsWith('data:') && !url.startsWith('blob:');

type TPanelAvatarProps = {
  value: string;
  onSave: (url: string) => void;
};

// Profile picture: upload, change or remove; saves as soon as it is stored.
const PanelAvatarUpload = ({ value, onSave }: TPanelAvatarProps) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });

  return (
    <Upload.Root
      value={value}
      onChange={(fileInfo) => {
        if (!('url' in fileInfo)) return;

        const url = fileInfo.url || '';

        if (url !== value && (!url || isStoredUrl(url))) {
          onSave(url);
        }
      }}
    >
      <div className="flex items-center gap-2 px-2 py-1">
        {/* The preview's image button is fixed at 64px; size it, not just
            its wrapper, or it spills onto the next row. */}
        <Upload.Preview className="size-10 shrink-0 [&>button]:size-10 [&>button]:rounded-full" />
        <Upload.Button size="sm" variant="outline" type="button">
          {t('upload', 'Upload')}
        </Upload.Button>
        <Upload.RemoveButton size="sm" variant="outline" type="button" />
      </div>
    </Upload.Root>
  );
};

/** The picture as one row of a record's fields. */
export const PanelAvatarField = (props: TPanelAvatarProps) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });

  return (
    <PanelField icon={IconPhoto} label={t('avatar', 'Avatar')} cell={false}>
      <PanelAvatarUpload {...props} />
    </PanelField>
  );
};

/** Opens the picture's editor from the avatar itself, like an inline cell. */
export const PanelAvatarPopover = ({
  children,
  ...props
}: TPanelAvatarProps & { children: ReactNode }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const label = t('avatar', 'Avatar');

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 rounded-full p-0"
          aria-label={label}
          title={label}
        >
          {children}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="start" className="w-auto p-1">
        <PanelAvatarUpload {...props} />
      </Popover.Content>
    </Popover>
  );
};
