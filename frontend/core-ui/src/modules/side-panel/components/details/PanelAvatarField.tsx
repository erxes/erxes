import { Upload } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PanelField } from 'ui-modules';

// Local previews (data:, blob:) are not saved; only the uploaded file is.
const isStoredUrl = (url: string) =>
  !url.startsWith('data:') && !url.startsWith('blob:');

// Profile picture: upload, change or remove; saves as soon as it is stored.
export const PanelAvatarField = ({
  value,
  onSave,
}: {
  value: string;
  onSave: (url: string) => void;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });

  return (
    <PanelField label={t('avatar', 'Avatar')} cell={false}>
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
    </PanelField>
  );
};
