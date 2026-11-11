import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, Form, Input, Spinner } from 'erxes-ui';
import { getFxaTaxLabel } from '@/adjustments/fxa/utils/fxaTaxLabels';

export const AdjustFixedAssetTaxRateDialog = ({
  taxRate,
  disabled,
  loading,
  onRun,
}: {
  taxRate?: number;
  disabled: boolean;
  loading: boolean;
  onRun: (taxRate: number) => Promise<unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  const form = useForm<{ taxRate: number }>({
    resolver: zodResolver(
      z.object({ taxRate: z.number().finite().min(0).max(100) }),
    ),
    defaultValues: { taxRate },
  });
  const label = getFxaTaxLabel(t, 'income-tax-rate');
  const submit = form.handleSubmit(async (values) => {
    try {
      await onRun(values.taxRate);
      setOpen(false);
    } catch {
      // The mutation hook displays the error; retain the entered rate for retry.
    }
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (loading) return;
        if (next) form.reset({ taxRate });
        setOpen(next);
      }}
    >
      <Dialog.Trigger asChild>
        <Button
          variant={taxRate === undefined ? 'default' : 'outline'}
          disabled={disabled}
        >
          {taxRate === undefined ? t('run') : `${label}: ${taxRate}%`}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>{label}</Dialog.Title>
          <Dialog.Description>
            {getFxaTaxLabel(t, 'income-tax-rate-run-description')}
          </Dialog.Description>
        </Dialog.Header>
        <Form {...form}>
          <form onSubmit={submit}>
            <Form.Field
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{label}</Form.Label>
                  <Form.Control>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      value={field.value ?? ''}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ''
                            ? undefined
                            : Number(event.target.value),
                        )
                      }
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Dialog.Footer className="mt-4">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" disabled={loading}>
                  {t('cancel')}
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={loading}>
                {loading && <Spinner />}
                {t('run')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
