import { IconPhotoUp, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Spinner, Textarea } from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useEmailBrandForm } from '../hooks/useEmailBrandForm';

/** The header and footer every customized notification email is sent in. */
export const NotificationEmailBrandForm = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const fileInput = useRef<HTMLInputElement>(null);
  const { form, logoUrl, color, loading, saving, uploading, uploadLogo, save } =
    useEmailBrandForm();

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-4">
        <p className="font-semibold text-sm tracking-tight">{t('brand')}</p>
        <p className="text-muted-foreground text-xs">
          {t('brand-description')}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={save}
          className="flex flex-col gap-4 bg-card p-4 border border-border rounded-xl"
        >
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('brand-name')}</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder={t('brand-name-placeholder')} />
                </Form.Control>
                <Form.Description>{t('brand-name-description')}</Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('brand-logo')}</Form.Label>
                <div className="flex items-center gap-3">
                  <div className="flex justify-center items-center bg-muted/40 border rounded-lg w-32 h-14 overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="" className="max-w-full max-h-10" />
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        {t('brand-no-logo')}
                      </span>
                    )}
                  </div>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => uploadLogo(e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileInput.current?.click()}
                  >
                    <IconPhotoUp />
                    {uploading ? t('uploading') : t('upload-logo')}
                  </Button>
                  {logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() =>
                        form.setValue('logoUrl', '', { shouldDirty: true })
                      }
                    >
                      <IconTrash />
                      {t('remove-logo')}
                    </Button>
                  )}
                </div>
                <Form.Control>
                  <Input {...field} placeholder="https://" />
                </Form.Control>
                <Form.Description>{t('brand-logo-description')}</Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="color"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('brand-color')}</Form.Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) =>
                      form.setValue('color', e.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className="bg-transparent border rounded w-10 h-9 cursor-pointer"
                    aria-label={t('brand-color')}
                  />
                  <Form.Control>
                    <Input {...field} className="w-32 font-mono" />
                  </Form.Control>
                </div>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="footerText"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('brand-footer')}</Form.Label>
                <Form.Control>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder={t('brand-footer-placeholder')}
                  />
                </Form.Control>
                <Form.Description>
                  {t('brand-footer-description')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !form.formState.isDirty}>
              {saving ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
