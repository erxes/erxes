import { IconCheck, IconPhoto, IconX } from '@tabler/icons-react';
import { Button, Dialog, IconPicker, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FilePicker } from 'ui-modules';
import {
  FILES_FOLDER_COLORS,
  isCoverImage,
  useFilesAppearance,
} from '../hooks/useFilesAppearance';

export const FilesAppearanceDialog = () => {
  const { t } = useTranslation('files');
  const appearance = useFilesAppearance();

  return (
    <>
      <Dialog
        open={appearance.open}
        onOpenChange={(next) => !next && appearance.close()}
      >
        <Dialog.Content className="max-w-md">
          <Dialog.Header>
            <Dialog.Title>{appearance.title}</Dialog.Title>
            <Dialog.Description>
              {t('appearance-description')}
            </Dialog.Description>
          </Dialog.Header>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t('color')}</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('no-color')}
                  className="border"
                  onClick={() => appearance.setColor(null)}
                >
                  {!appearance.draft.color && <IconCheck />}
                </Button>
                {FILES_FOLDER_COLORS.map((color) => (
                  <Button
                    key={color}
                    variant="ghost"
                    size="icon"
                    aria-label={color}
                    style={{ backgroundColor: color }}
                    onClick={() => appearance.setColor(color)}
                  >
                    {appearance.draft.color === color && (
                      <IconCheck className="text-white" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label>{t('icon')}</Label>
              <IconPicker
                value={appearance.draft.icon || undefined}
                onValueChange={appearance.setIcon}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t('cover-image')}</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => appearance.setPickerOpen(true)}
                >
                  <IconPhoto />
                  {appearance.hasCover ? t('change-cover') : t('choose-cover')}
                </Button>
                {appearance.hasCover && (
                  <>
                    <span className="truncate text-xs text-muted-foreground">
                      {appearance.coverName || t('cover-set')}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('remove-cover')}
                      onClick={appearance.removeCover}
                    >
                      <IconX />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <Dialog.Footer>
            <Button variant="secondary" onClick={appearance.close}>
              {t('cancel')}
            </Button>
            <Button disabled={appearance.loading} onClick={appearance.submit}>
              {t('save')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <FilePicker
        open={appearance.pickerOpen}
        onOpenChange={appearance.setPickerOpen}
        onSelect={appearance.pickCover}
        accept={isCoverImage}
        title={t('choose-cover')}
      />
    </>
  );
};
