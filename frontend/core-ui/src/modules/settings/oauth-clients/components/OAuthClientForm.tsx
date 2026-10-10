import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Form, Input, Select, StringArrayInput, Textarea } from 'erxes-ui';
import { TOAuthClientsForm } from '../hooks/useOAuthClientsForm';
import { OAUTH_CLIENT_ACCESS_TOKEN_LIFETIME_OPTIONS } from '../types';
import { OAuthClientLogoUpload } from './OAuthClientLogoUpload';

export const OAuthClientForm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'oauth-clients' });
  const form = useFormContext<TOAuthClientsForm>();
  const clientType = form.watch('type');
  const showAccessTokenLifetime = clientType === 'confidential';

  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('name')}</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="erxes-local" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('description')}</Form.Label>
            <Form.Control>
              <Textarea
                {...field}
                value={field.value || ''}
                placeholder={t('description-placeholder')}
                className="min-h-24 resize-none"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="logo"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('logo')}</Form.Label>
            <Form.Control>
              <OAuthClientLogoUpload
                value={field.value || ''}
                onChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="type"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('client-type')}</Form.Label>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);

                if (value === 'public') {
                  form.setValue('accessTokenLifetime', undefined, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  return;
                }

                if (!form.getValues('accessTokenLifetime')) {
                  form.setValue('accessTokenLifetime', 'year', {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            >
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder={t('choose-a-type')} />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                <Select.Item value="public">{t('type-public')}</Select.Item>
                <Select.Item value="confidential">
                  {t('type-confidential')}
                </Select.Item>
              </Select.Content>
            </Select>
            <Form.Description>{t('client-type-description')}</Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      {showAccessTokenLifetime && (
        <Form.Field
          control={form.control}
          name="accessTokenLifetime"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('access-token-lifetime')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder={t('choose-a-lifetime')} />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {OAUTH_CLIENT_ACCESS_TOKEN_LIFETIME_OPTIONS.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Description>
                {t('access-token-lifetime-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}

      <Form.Field
        control={form.control}
        name="redirectUrls"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('redirect-urls')}</Form.Label>
            <Form.Control>
              <StringArrayInput
                value={field.value || []}
                onValueChange={field.onChange}
                placeholder={t('add-callback-url')}
                styleClasses={{
                  inlineTagsContainer: `shadow-xs ${
                    field.value?.length ? 'p-2' : ''
                  }`,
                }}
              />
            </Form.Control>
            <Form.Description>
              {t('redirect-urls-description')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
