import { IconAlertTriangle } from '@tabler/icons-react';
import { Alert, Button, Form, Input, Sheet, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useConditionForm } from '@/products/settings/hooks/useConditionForm';
import { IProductCondition } from './types';

export const ConditionForm = ({
  condition,
  onDone,
}: {
  condition?: IProductCondition;
  onDone: (saved?: IProductCondition) => void;
}) => {
  const { t } = useTranslation('product');
  const { form, submit, codeChanged, saving } = useConditionForm({
    condition,
    onDone,
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} className="flex flex-col h-full">
        <Sheet.Header>
          <Sheet.Title>
            {condition
              ? t('edit-condition', 'Edit condition')
              : t('add-condition', 'Add condition')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex flex-col gap-4 p-5 overflow-y-auto">
          <Form.Field
            control={form.control}
            name="code"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('code', 'Code')}</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder={t('condition-code', 'e.g. DENTED')} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          {codeChanged && condition && (
            <Alert variant="warning">
              <IconAlertTriangle />
              <Alert.Title>
                {t('condition-code-change-title', 'Products keep the old code')}
              </Alert.Title>
              <Alert.Description>
                {t(
                  'condition-code-change-description',
                  '{{count}} products and any pricing discounts use "{{code}}". They stop matching this condition until they are set to the new code or it is changed back.',
                  { count: condition.productCount ?? 0, code: condition.code },
                )}
              </Alert.Description>
            </Alert>
          )}
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('name', 'Name')}</Form.Label>
                <Form.Control>
                  <Input {...field} placeholder={t('condition-name', 'e.g. Dented')} />
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
                <Form.Label>{t('description', 'Description')}</Form.Label>
                <Form.Control>
                  <Textarea {...field} />
                </Form.Control>
              </Form.Item>
            )}
          />
        </Sheet.Content>
        <Sheet.Footer>
          <Button type="button" variant="ghost" onClick={() => onDone()}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={saving}>
            {t('save', 'Save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
