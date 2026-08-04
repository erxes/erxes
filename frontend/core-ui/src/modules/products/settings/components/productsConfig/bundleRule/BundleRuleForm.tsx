import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Sheet, Textarea, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useBundleRulesAdd } from '@/products/settings/hooks/useBundleRulesAdd';
import { useBundleRulesEdit } from '@/products/settings/hooks/useBundleRulesEdit';
import { IBundleRule, IBundleRuleItem } from './types';
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';
import { useState } from 'react';
import { BundleRuleItemForm } from './BundleRuleItemForm';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rules, setRules] = useState<IBundleRuleItem[]>(
    bundleRule?.rules || [],
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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

  const handleAddItem = (data: IBundleRuleItem) => {
    if (editingIndex === null) {
      setRules([...rules, data]);
      setIsDialogOpen(false);
      return;
    }

    const updatedRules = [...rules];
    updatedRules[editingIndex] = data;
    setRules(updatedRules);
    setEditingIndex(null);
    setIsDialogOpen(false);
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleOpenDialog = () => {
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIndex(null);
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
          rules: rules,
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
          rules: rules,
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

            <Button
              type="button"
              variant="secondary"
              onClick={handleOpenDialog}
            >
              <IconPlus />
              Add Row
            </Button>

            {rules.length > 0 && (
              <div className="overflow-hidden mt-3 rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left">Code</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{rule.code || '-'}</td>
                        <td className="flex gap-2 justify-end px-4 py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(index)}
                          >
                            <IconEdit className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteItem(index)}
                          >
                            <IconTrash className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? bundleRule
                ? t('updating')
                : t('creating')
              : bundleRule
              ? t('update')
              : t('create')}
          </Button>
        </Sheet.Footer>
      </form>

      <BundleRuleItemForm
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={handleAddItem}
        editingItem={editingIndex !== null ? rules[editingIndex] : undefined}
        editingIndex={editingIndex}
      />
    </Form>
  );
};
