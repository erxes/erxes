import { IconChevronLeft, IconLoader2 } from '@tabler/icons-react';
import { Button, Form, Input, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useConditionForm } from '@/products/settings/hooks/useConditionForm';
import { IProductCondition } from './types';

// Creates a condition inside a picker, so choosing one never means leaving the screen.
export const ConditionQuickCreate = ({
  defaultName,
  onBack,
  onCreated,
}: {
  defaultName: string;
  onBack: () => void;
  onCreated: (condition: IProductCondition) => void;
}) => {
  const { t } = useTranslation('product');
  const { form, submit, saving } = useConditionForm({
    defaultName,
    onDone: (saved) => saved && onCreated(saved),
  });

  return (
    <Form {...form}>
      <form onSubmit={submit}>
        <div className="flex items-center p-1 font-medium">
          <Button
            type="button"
            variant="ghost"
            className="gap-1 pl-1"
            onClick={onBack}
          >
            <IconChevronLeft />
            {t('add-condition', 'Add condition')}
          </Button>
        </div>
        <Separator />
        <div className="flex flex-col gap-3 p-3">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('name', 'Name')}</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="code"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('code', 'Code')}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    autoFocus
                    placeholder={t('condition-code', 'e.g. DENTED')}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <Separator />
        <div className="p-3">
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              t('create', 'Create')
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
