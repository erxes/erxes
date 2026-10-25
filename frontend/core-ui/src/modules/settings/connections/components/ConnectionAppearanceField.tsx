import { IconTrash } from '@tabler/icons-react';
import { Button, Form, IconPicker, Upload } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TConnectionForm } from '@/settings/connections/form';

/**
 * Required appearance: an icon from the erxes-ui set, or an uploaded logo
 * (which takes precedence where both are set).
 */
export const ConnectionAppearanceField = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'connections' });
  const form = useFormContext<TConnectionForm>();
  const logo = form.watch('logo');

  return (
    <Form.Field
      control={form.control}
      name="icon"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('icon-or-logo', 'Icon or logo')}</Form.Label>
          <div className="flex items-center gap-3">
            <Form.Control>
              <IconPicker
                // The picker keeps its own selection; remount on reset.
                key={field.value || 'none'}
                value={field.value || undefined}
                onValueChange={(icon) =>
                  form.setValue('icon', icon || '', {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className="size-16 border"
                aria-label={t('choose-icon', 'Choose an icon')}
              />
            </Form.Control>
            <span className="text-xs text-muted-foreground">
              {t('or', 'or')}
            </span>
            <Upload.Root
              value={logo || ''}
              onChange={(value) =>
                form.setValue('logo', 'url' in value ? value.url || '' : '', {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="items-center"
            >
              <Upload.Preview />
              <div className="flex flex-col gap-1">
                <Upload.Button type="button" variant="outline" size="sm" />
                {logo ? (
                  // Clears the form value only: the file stays stored until
                  // the change is saved, so cancelling loses nothing.
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      form.setValue('logo', '', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <IconTrash />
                    {t('remove-logo', 'Remove logo')}
                  </Button>
                ) : null}
              </div>
            </Upload.Root>
          </div>
          <Form.Description>
            {t(
              'icon-or-logo-description',
              'Pick an icon, or upload the provider’s logo.',
            )}
          </Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
