import { zodResolver } from '@hookform/resolvers/zod';
import { IconSparkles } from '@tabler/icons-react';
import {
  Button,
  Editor,
  Form,
  Input,
  Spinner,
  ToggleGroup,
  useConfirm,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CLIENTPORTAL_PASSWORD_VERIFICATION_SCHEMA } from '../constants/clientPortalEditSchema';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';
import { IClientPortal } from '../types/clientPortal';
import { useTranslation } from 'react-i18next';

const RESET_URL_PLACEHOLDER = '{{resetUrl}}';
const CODE_PLACEHOLDER = '{{code}}';

const hasTextContent = (html?: string) =>
  Boolean(html?.replace(/<[^>]*>/g, '').trim());

export const ClientPortalDetailResetPassword = ({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });
  const resetPasswordConfig =
    clientPortal?.securityAuthConfig?.resetPasswordConfig;
  const form = useForm<
    z.infer<typeof CLIENTPORTAL_PASSWORD_VERIFICATION_SCHEMA>
  >({
    resolver: zodResolver(CLIENTPORTAL_PASSWORD_VERIFICATION_SCHEMA),
    defaultValues: {
      verifyByOTP: resetPasswordConfig?.mode === 'code',
      emailSubject: resetPasswordConfig?.emailSubject,
      emailContent: resetPasswordConfig?.emailContent,
      smsContent: '',
    },
  });
  const { updateClientPortal, loading } = useUpdateClientPortal();
  const isCodeMode = form.watch('verifyByOTP');
  const { confirm } = useConfirm();

  const buildDefaultContent = () => {
    const ignoreText = t('default-reset-email-ignore');

    if (isCodeMode) {
      return [
        `<p>${t('default-reset-email-greeting')}</p>`,
        `<p>${t('default-reset-email-code-body', {
          placeholder: CODE_PLACEHOLDER,
        })}</p>`,
        `<p>${ignoreText}</p>`,
      ].join('');
    }

    return [
      `<p>${t('default-reset-email-greeting')}</p>`,
      `<p>${t('default-reset-email-link-body')}</p>`,
      `<p><a href="${RESET_URL_PLACEHOLDER}">${RESET_URL_PLACEHOLDER}</a></p>`,
      `<p>${t('default-reset-email-link-expiry')} ${ignoreText}</p>`,
    ].join('');
  };

  const handleGenerateContent = () => {
    const applyDefaultContent = () =>
      form.setValue('emailContent', buildDefaultContent(), {
        shouldDirty: true,
      });

    if (!hasTextContent(form.getValues('emailContent'))) {
      applyDefaultContent();
      return;
    }

    confirm({
      message: t('replace-email-content-confirm'),
      options: { okLabel: t('replace') },
    }).then(applyDefaultContent);
  };

  function handleSubmit(
    data: z.infer<typeof CLIENTPORTAL_PASSWORD_VERIFICATION_SCHEMA>,
  ) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: {
          securityAuthConfig: {
            resetPasswordConfig: {
              mode: data.verifyByOTP ? 'code' : 'link',
              emailSubject: data.emailSubject || '',
              emailContent: data.emailContent || '',
            },
          },
        },
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        <Form.Field
          control={form.control}
          name="verifyByOTP"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('verify-by-link-or-code')}</Form.Label>
              <Form.Control>
                <ToggleGroup
                  type="single"
                  value={field.value ? 'code' : 'link'}
                  onValueChange={(value) => field.onChange(value === 'code')}
                  variant="outline"
                >
                  <ToggleGroup.Item value="link" className="flex-auto">
                    {t('link')}
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value="code" className="flex-auto">
                    {t('code')}
                  </ToggleGroup.Item>
                </ToggleGroup>
              </Form.Control>
              <Form.Description>
                {isCodeMode
                  ? t('reset-mode-code-description')
                  : t('reset-mode-link-description')}
              </Form.Description>
              <Form.Description>
                {t('reset-mode-phone-description')}
              </Form.Description>
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="emailSubject"
          render={({ field }) => (
            <Form.Item className="col-start-1">
              <Form.Label>{t('email-subject')}</Form.Label>
              <Input {...field} />
              <Form.Description>
                {t('reset-email-subject-description')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="emailContent"
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Form.Label>{t('email-content')}</Form.Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateContent}
                >
                  <IconSparkles />
                  {t('generate-default-content')}
                </Button>
              </div>
              <Editor
                initialContent={field.value}
                onChange={field.onChange}
                isHTML
              />
              <Form.Description>
                {isCodeMode
                  ? t('reset-email-content-code-description', {
                      placeholder: CODE_PLACEHOLDER,
                    })
                  : t('reset-email-content-link-description', {
                      placeholder: RESET_URL_PLACEHOLDER,
                    })}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Button
          type="submit"
          className="mt-2 col-span-2"
          disabled={loading}
          variant="secondary"
        >
          {loading && <Spinner containerClassName="w-auto flex-none" />}
          {t('save')}
        </Button>
      </form>
    </Form>
  );
};
