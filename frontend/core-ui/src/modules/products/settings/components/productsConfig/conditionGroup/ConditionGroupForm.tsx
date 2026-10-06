import { IconPlus, IconX } from '@tabler/icons-react';
import { Button, Form, Input, Sheet, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useConditionGroupForm } from '@/products/settings/hooks/useConditionGroupForm';
import { IProductConditionGroup } from './types';

export const ConditionGroupForm = ({
  group,
  onDone,
}: {
  group?: IProductConditionGroup;
  onDone: () => void;
}) => {
  const { t } = useTranslation('product');
  const { form, conditions, submit, saving } = useConditionGroupForm({
    group,
    onDone,
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} className="flex flex-col h-full">
        <Sheet.Header>
          <Sheet.Title>
            {group
              ? t('edit-condition-group', 'Edit condition group')
              : t('add-condition-group', 'Add condition group')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex flex-col gap-4 p-5 overflow-y-auto">
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
          <div className="flex flex-col gap-2">
            <Form.Label>{t('conditions', 'Conditions')}</Form.Label>
            {conditions.fields.map((condition, index) => (
              <Form.Field
                key={condition.id}
                control={form.control}
                name={`conditions.${index}.name`}
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex gap-2">
                      <Form.Control>
                        <Input
                          {...field}
                          placeholder={t('condition-name', 'e.g. Dented')}
                        />
                      </Form.Control>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={conditions.fields.length === 1}
                        onClick={() => conditions.remove(index)}
                      >
                        <IconX />
                      </Button>
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            ))}
            <Button
              type="button"
              variant="secondary"
              className="self-start"
              onClick={() => conditions.append({ name: '' })}
            >
              <IconPlus />
              {t('add-condition', 'Add condition')}
            </Button>
            {form.formState.errors.conditions?.root?.message && (
              <p className="text-sm text-destructive">
                {form.formState.errors.conditions.root.message}
              </p>
            )}
          </div>
        </Sheet.Content>
        <Sheet.Footer>
          <Button type="button" variant="ghost" onClick={onDone}>
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
