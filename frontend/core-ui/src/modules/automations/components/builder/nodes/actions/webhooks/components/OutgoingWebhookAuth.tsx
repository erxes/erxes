import { useTranslation } from 'react-i18next';
import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { IconKey } from '@tabler/icons-react';
import { Form, Input, Label, Select, Textarea } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const OutgoingWebhookAuth = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TOutgoingWebhookForm>();

  return (
    <>
      <div className="space-y-4">
        <Form.Field
          control={control}
          name="auth"
          render={({ field }) => {
            const { value: authObj, onChange } = field;

            return (
              <Form.Item>
                <Form.Label>{t('webhook-authentication')}</Form.Label>
                <Select
                  defaultValue="none"
                  value={authObj?.type}
                  onValueChange={(value) =>
                    onChange({ ...authObj, type: value })
                  }
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="none">
                      {t('webhook-auth-none')}
                    </Select.Item>
                    <Select.Item value="basic">
                      {t('webhook-auth-basic')}
                    </Select.Item>
                    <Select.Item value="bearer">
                      {t('webhook-auth-bearer')}
                    </Select.Item>
                    <Select.Item value="jwt">JWT Bearer</Select.Item>
                  </Select.Content>
                </Select>

                {authObj?.type === 'basic' && (
                  <OutgoingWebhookBasicType
                    authObj={authObj}
                    onChange={onChange}
                  />
                )}

                {authObj?.type === 'bearer' && (
                  <OutgoingWebhookBearerType
                    authObj={authObj}
                    onChange={onChange}
                  />
                )}

                {authObj?.type === 'jwt' && (
                  <OutgoingWebhookJWTType
                    authObj={authObj}
                    onChange={onChange}
                  />
                )}
                <Form.Message />
              </Form.Item>
            );
          }}
        />
      </div>
    </>
  );
};

const OutgoingWebhookBasicType = ({
  authObj,
  onChange,
}: {
  authObj: Extract<TOutgoingWebhookForm['auth'], { type: 'basic' }>;
  onChange: (...event: any[]) => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>{t('webhook-auth-user')}</Label>
        <Input
          placeholder={t('webhook-auth-user-placeholder')}
          className="font-mono"
          onChange={(e) =>
            onChange({
              ...authObj,
              username: e.currentTarget.value,
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>{t('webhook-auth-password')}</Label>
        <Input
          type="password"
          placeholder={t('webhook-auth-password-placeholder')}
          className="font-mono"
          onChange={(e) =>
            onChange({
              ...authObj,
              password: e.currentTarget.value,
            })
          }
        />
      </div>
    </div>
  );
};
const OutgoingWebhookBearerType = ({
  authObj,
  onChange,
}: {
  authObj: Extract<TOutgoingWebhookForm['auth'], { type: 'bearer' }>;
  onChange: (...event: any[]) => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="space-y-2">
      <Label>{t('value')}</Label>
      <Input
        placeholder="Bearer {{ $vars.token }}"
        className="font-mono"
        onChange={(e) => onChange({ ...authObj, token: e.currentTarget.value })}
      />
    </div>
  );
};

const OutgoingWebhookJWTType = ({
  authObj,
  onChange,
}: {
  authObj: Extract<TOutgoingWebhookForm['auth'], { type: 'jwt' }>;
  onChange: (...event: any[]) => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('webhook-jwt-secret')}</Label>
          <Input
            type="password"
            placeholder={t('webhook-jwt-secret-placeholder')}
            className="font-mono"
            onChange={(e) =>
              onChange({
                ...authObj,
                secretKey: e.currentTarget.value,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>{t('webhook-jwt-algorithm')}</Label>
          <Select
            defaultValue="HS256"
            value={authObj.algorithm}
            onValueChange={(value) =>
              onChange({ ...authObj, algorithm: value })
            }
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="HS256">HS256</Select.Item>
              <Select.Item value="HS384">HS384</Select.Item>
              <Select.Item value="HS512">HS512</Select.Item>
              <Select.Item value="RS256">RS256</Select.Item>
              <Select.Item value="RS384">RS384</Select.Item>
              <Select.Item value="RS512">RS512</Select.Item>
              <Select.Item value="ES256">ES256</Select.Item>
              <Select.Item value="ES384">ES384</Select.Item>
              <Select.Item value="ES512">ES512</Select.Item>
            </Select.Content>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('webhook-jwt-header')}</Label>
        <Textarea
          placeholder='{"typ": "JWT", "alg": "HS256"}'
          className="font-mono text-sm min-h-[80px]"
          onChange={(e) =>
            onChange({
              ...authObj,
              header: e.currentTarget.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>{t('webhook-jwt-payload')}</Label>
        <Textarea
          placeholder='{"sub": "{{ workflow.id }}", "iat": "{{ now }}", "exp": "{{ now + 3600 }}"}'
          className="font-mono text-sm min-h-[120px]"
          onChange={(e) =>
            onChange({
              ...authObj,
              claims: e.currentTarget.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>{t('webhook-jwt-token-placement')}</Label>
        <Select
          defaultValue="header"
          value={authObj.placement}
          onValueChange={(value) => onChange({ ...authObj, placement: value })}
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="header">
              {t('webhook-jwt-placement-header')}
            </Select.Item>
            <Select.Item value="query">
              {t('webhook-jwt-placement-query')}
            </Select.Item>
            <Select.Item value="body">
              {t('webhook-jwt-placement-body')}
            </Select.Item>
          </Select.Content>
        </Select>
      </div>

      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <IconKey className="size-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">
              {t('webhook-jwt-generation-title')}
            </p>
            <p className="text-xs text-primary/70">
              {t('webhook-jwt-generation-description')}
            </p>
            <div className="mt-2 text-xs text-primary font-mono bg-primary/20 p-2 rounded">
              {t('webhook-jwt-example')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
