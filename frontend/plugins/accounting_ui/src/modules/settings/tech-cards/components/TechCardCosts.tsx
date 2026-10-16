import { useTranslation } from 'react-i18next';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  CurrencyField,
  Form,
  Input,
  PopoverScoped,
  RecordTableInlineCell,
  Table,
} from 'erxes-ui';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { TTechCardForm } from '../types/TechCard';

export const TechCardCosts = ({
  form,
  name,
  title,
}: {
  form: UseFormReturn<TTechCardForm>;
  name: 'laborCosts' | 'overheadCosts';
  title: string;
}) => {
  const { t } = useTranslation('accounting');
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <Form.Label>{title}</Form.Label>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => append({ name: '', amount: 0, accountId: '' })}
        >
          <IconPlus />
          {t('tech-card-add-row')}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[560px]" aria-label={title}>
          <Table.Header>
            <Table.Row>
              <Table.Head>{t('name')}</Table.Head>
              <Table.Head className="w-32">{t('amount')}</Table.Head>
              <Table.Head className="w-60">{t('account')}</Table.Head>
              <Table.Head className="w-8">
                <span className="sr-only">{t('tech-card-remove-row')}</span>
              </Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fields.map((row, index) => (
              <Table.Row key={row.id} className="h-cell hover:bg-background!">
                <Table.Cell className="whitespace-normal">
                  <Form.Field
                    control={form.control}
                    name={`${name}.${index}.name`}
                    render={({ field }) => (
                      <Form.Item className="space-y-0">
                        <Form.Label className="sr-only">{t('name')}</Form.Label>
                        <PopoverScoped
                          scope={`${name}.${index}.name`}
                          closeOnEnter
                        >
                          <Form.Control>
                            <RecordTableInlineCell.Trigger>
                              {field.value || '-'}
                            </RecordTableInlineCell.Trigger>
                          </Form.Control>
                          <RecordTableInlineCell.Content>
                            <Input {...field} />
                          </RecordTableInlineCell.Content>
                        </PopoverScoped>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </Table.Cell>
                <Table.Cell className="whitespace-normal">
                  <Form.Field
                    control={form.control}
                    name={`${name}.${index}.amount`}
                    render={({ field }) => (
                      <Form.Item className="space-y-0">
                        <Form.Label className="sr-only">
                          {t('amount')}
                        </Form.Label>
                        <PopoverScoped
                          scope={`${name}.${index}.amount`}
                          closeOnEnter
                        >
                          <Form.Control>
                            <RecordTableInlineCell.Trigger>
                              {field.value?.toLocaleString() ?? 0}
                            </RecordTableInlineCell.Trigger>
                          </Form.Control>
                          <RecordTableInlineCell.Content>
                            <CurrencyField.ValueInput
                              value={field.value}
                              onChange={(value) => field.onChange(value ?? 0)}
                            />
                          </RecordTableInlineCell.Content>
                        </PopoverScoped>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </Table.Cell>
                <Table.Cell className="whitespace-normal">
                  <Form.Field
                    control={form.control}
                    name={`${name}.${index}.accountId`}
                    render={({ field }) => (
                      <Form.Item className="space-y-0">
                        <Form.Label className="sr-only">
                          {t('account')}
                        </Form.Label>
                        <SelectAccount
                          value={field.value}
                          onValueChange={field.onChange}
                          variant="ghost"
                          defaultFilter={{ permissionMode: 'write' }}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </Table.Cell>
                <Table.Cell className="w-8">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t('tech-card-remove-group-row', {
                      group: title,
                      row: index + 1,
                    })}
                    title={t('tech-card-remove-row')}
                    onClick={() => remove(index)}
                  >
                    <IconTrash />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
            {fields.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={4} className="px-2 text-muted-foreground">
                  {t('tech-card-no-costs')}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};
