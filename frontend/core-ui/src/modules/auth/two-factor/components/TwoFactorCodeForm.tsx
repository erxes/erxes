import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, InputOTP, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  TTwoFactorCodeForm,
  twoFactorCodeSchema,
} from '@/auth/two-factor/schema';

export const TwoFactorCodeForm = ({
  onSubmit,
  loading,
  submitLabel,
  allowRecovery = false,
}: {
  onSubmit: (code: string) => void;
  loading: boolean;
  submitLabel: string;
  allowRecovery?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'two-factor' });
  const [useRecovery, setUseRecovery] = useState(false);
  const form = useForm<TTwoFactorCodeForm>({
    resolver: zodResolver(twoFactorCodeSchema(allowRecovery)),
    defaultValues: { code: '' },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ code }) => onSubmit(code))}
        className="grid gap-4"
      >
        <Form.Field
          control={form.control}
          name="code"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {useRecovery ? t('recovery-code') : t('authenticator-code')}
              </Form.Label>
              <Form.Control>
                {useRecovery ? (
                  <Input
                    autoFocus
                    autoComplete="off"
                    maxLength={9}
                    placeholder="xxxx-xxxx"
                    className="font-mono tracking-widest"
                    {...field}
                  />
                ) : (
                  <InputOTP
                    autoFocus
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="^[0-9]*$"
                    containerClassName="justify-center"
                    {...field}
                  >
                    <InputOTP.Group>
                      <InputOTP.Slot index={0} />
                      <InputOTP.Slot index={1} />
                      <InputOTP.Slot index={2} />
                    </InputOTP.Group>
                    <InputOTP.Separator />
                    <InputOTP.Group>
                      <InputOTP.Slot index={3} />
                      <InputOTP.Slot index={4} />
                      <InputOTP.Slot index={5} />
                    </InputOTP.Group>
                  </InputOTP>
                )}
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading && <Spinner size="sm" />}
          {submitLabel}
        </Button>
        {allowRecovery && (
          <Button
            type="button"
            variant="link"
            className="text-muted-foreground"
            onClick={() => {
              setUseRecovery((value) => !value);
              form.reset({ code: '' });
            }}
          >
            {useRecovery ? t('use-authenticator') : t('use-recovery-code')}
          </Button>
        )}
      </form>
    </Form>
  );
};
