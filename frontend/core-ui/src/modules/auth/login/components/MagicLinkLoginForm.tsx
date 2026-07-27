import { useLoginMagicLink } from '@/auth/login/hooks/useLoginMagicLink';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { Button, Form, Input, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MagicLinkLoginForm = () => {
  const { t } = useTranslation('auth');
  const { form, onMagicLinkSubmit, onGoogleLogin } = useLoginMagicLink();

  return (
    <Form {...form}>
      <form onSubmit={onMagicLinkSubmit} className="mx-auto grid gap-5">
        <div className="text-center text-sm text-accent-foreground">
          {t('magic-link-description', "We use magic link so you don't have to remember or type in yet another long password")}
        </div>
        <Form.Field
          name="email"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="font-sans normal-case text-foreground text-sm font-medium leading-none">
                {t('email', 'Email')}
              </Form.Label>
              <Form.Message />
              <Form.Control>
                <Input
                  type="email"
                  placeholder={t('enter-your-email', 'Enter your email')}
                  className="h-8"
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Button type="submit" className="h-8">
          {t('continue', 'Continue')}
        </Button>
        <Label className="text-center">{t('or', 'OR')}</Label>
        <Button variant="secondary" onClick={onGoogleLogin} type="button">
          <IconBrandGoogleFilled />
          {t('continue-with-google', 'Continue with Google')}
        </Button>
      </form>
    </Form>
  );
};
