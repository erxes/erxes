import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Sheet, Textarea, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useBundleRulesAdd } from '@/products/settings/hooks/useBundleRulesAdd';
import { useBundleRulesEdit } from '@/products/settings/hooks/useBundleRulesEdit';
import { IBundleRule } from './types';

const bundleRuleFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  code: z.string().min(1, 'Code is required'),
});

interface IBundleRuleFormProps {
  bundleRule?: IBundleRule;
  onOpenChange?: (open: boolean) => void;
}

export const BundleRuleForm = ({
  bundleRule,
  onOpenChange,
}: IBundleRuleFormProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const { bundleRulesAdd, loading: loadingAdd } = useBundleRulesAdd();
  const { bundleRulesEdit, loading: loadingEdit } = useBundleRulesEdit();

  const form = useForm<{ name: string; description?: string; code?: string }>({
    defaultValues: bundleRule
      ? {
          name: bundleRule.name,
          description: bundleRule.description ?? '',
          code: bundleRule.code ?? '',
        }
      : { name: '', description: '', code: '' },
    resolver: zodResolver(bundleRuleFormSchema),
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
    if (bundleRule) {
      bundleRulesEdit({
        variables: {
          _id: bundleRule._id,
          name: data.name,
          description: data.description || null,
          code: data.code || null,
          rules: bundleRule.rules || [],
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
      bundleRulesAdd({
        variables: {
          name: data.name,
          description: data.description || null,
          code: data.code || null,
          rules: [],
        },
        onCompleted: () => {
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
            {bundleRule ? t('edit-bundle-rule') : t('add-bundle-rule')}
          </Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            {bundleRule ? t('edit-bundle-rule') : t('add-bundle-rule')}
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
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={handleCancel}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? t('creating') : t('create')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
