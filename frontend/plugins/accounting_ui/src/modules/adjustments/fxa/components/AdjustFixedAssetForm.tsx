import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, DatePicker, Form, Sheet, Spinner, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAdjustFixedAssetAdd } from '../hooks/useAdjustFixedAssetMutations';
import {
  adjustFixedAssetSchema,
  TAdjustFixedAssetForm,
} from '../types/adjustFixedAssetSchema';

export const AddAdjustFixedAsset = () => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-fixed-asset-adjustment')}
        </Button>
      </Sheet.Trigger>
      <AccountingSheet title={t('add-fixed-asset-adjustment')}>
        <AddAdjustFixedAssetForm setOpen={setOpen} />
      </AccountingSheet>
    </Sheet>
  );
};

const AddAdjustFixedAssetForm = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('accounting');
  const form = useForm<TAdjustFixedAssetForm>({
    resolver: zodResolver(adjustFixedAssetSchema),
    defaultValues: {
      date: new Date(),
      description: '',
    },
  });
  const { addAdjustFixedAsset, loading } = useAdjustFixedAssetAdd();

  const onSubmit = (data: TAdjustFixedAssetForm) => {
    addAdjustFixedAsset({
      variables: data,
      onCompleted: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col flex-1 min-h-0 bg-background"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          <Form.Field
            control={form.control}
            name="date"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('date')}</Form.Label>
                <Form.Control>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    className="h-8 flex w-full"
                  />
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
                  <Textarea placeholder={t('enter-description')} {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>

        <Sheet.Footer className="px-5 border-t bg-background shrink-0">
          <Button
            variant="outline"
            type="button"
            size="lg"
            onClick={() => setOpen(false)}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Spinner />}
            {t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
