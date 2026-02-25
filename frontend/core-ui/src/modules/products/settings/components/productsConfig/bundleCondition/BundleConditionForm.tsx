import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Sheet, Textarea, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useBundleConditionAdd } from '@/products/settings/hooks/useBundleConditionAdd';
import { useBundleConditionEdit } from '@/products/settings/hooks/useBundleConditionEdit';
import { IBundleCondition } from './types';

const bundleConditionFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  code: z.string().min(1, 'Code is required'),
});

interface IBundleConditionFormProps {
  bundleCondition?: IBundleCondition;
  onOpenChange?: (open: boolean) => void;
}

export const BundleConditionForm = ({
  bundleCondition,
  onOpenChange,
}: IBundleConditionFormProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const { bundleConditionAdd, loading: loadingAdd } = useBundleConditionAdd();
  const { bundleConditionEdit, loading: loadingEdit } =
    useBundleConditionEdit();

  const form = useForm<{ name: string; description?: string; code?: string }>({
    defaultValues: bundleCondition
      ? {
          name: bundleCondition.name,
          description: bundleCondition.description ?? '',
          code: bundleCondition.code ?? '',
        }
      : { name: '', description: '', code: '' },
    resolver: zodResolver(bundleConditionFormSchema),
  });

  const handleCancel = () => {
    form.reset();
    onOpenChange?.(false);
  };

  const onSubmit = (data: {
    name: string;
    description?: string;
    code?: string;
  }) => {
    if (bundleCondition) {
      bundleConditionEdit({
        variables: {
          _id: bundleCondition._id,
          name: data.name,
          description: data.description || null,
          code: data.code || null,
        },
        onCompleted: () => {
          onOpenChange?.(false);
        },
        onError: (e) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    } else {
      bundleConditionAdd({
        variables: {
          name: data.name,
          description: data.description || null,
          code: data.code || null,
        },
        onCompleted: () => {
          toast({
            title: 'Success',
            description: t('bundle-condition-added'),
          });
          form.reset();
          onOpenChange?.(false);
        },
        onError: (e) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    }
  };

  const isLoading = loadingAdd || loadingEdit;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex overflow-hidden flex-col h-full"
      >
        <Sheet.Header className="flex-row gap-3 items-center p-5 space-y-0 border-b">
          <Sheet.Title>
            {bundleCondition
              ? t('edit-bundle-condition')
              : t('add-bundle-condition')}
          </Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            {bundleCondition
              ? t('edit-bundle-condition')
              : t('add-bundle-condition')}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <div className="flex flex-col gap-4 p-5 w-full">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item className="w-full">
                  <Form.Label>
                    {t('name')} <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <Input placeholder={t('name')} {...field} autoFocus />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="code"
              render={({ field }) => (
                <Form.Item className="w-full">
                  <Form.Label>
                    {t('code')} <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <Input placeholder={t('code')} {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item className="w-full">
                  <Form.Label>{t('description')}</Form.Label>
                  <Form.Control>
                    <Textarea
                      placeholder={t('description')}
                      {...field}
                      value={field.value ?? ''}
                      rows={3}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? bundleCondition
                ? t('updating')
                : t('creating')
              : bundleCondition
              ? t('update')
              : t('create')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
