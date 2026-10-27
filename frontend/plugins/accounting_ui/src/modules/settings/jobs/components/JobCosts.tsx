import { useTranslation } from 'react-i18next';
import { useEffect, useId, useState } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  CurrencyField,
  Form,
  Input,
  Label,
  PopoverScoped,
  RecordTableInlineCell,
  Table,
  Switch,
} from 'erxes-ui';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { TJobForm } from '../types/Job';

export const JobCosts = ({
  form,
  name,
  title,
}: {
  form: UseFormReturn<TJobForm>;
  name: 'laborCosts' | 'overheadCosts';
  title: string;
}) => {
  const { t } = useTranslation('accounting');
  const toggleId = useId();
  const defaultRows = form.formState.defaultValues?.[name];
  const groupErrors = form.formState.errors[name];
  const [enabled, setEnabled] = useState(() =>
    Boolean(form.getValues(name)?.length),
  );
  useEffect(() => {
    setEnabled(Boolean(defaultRows?.length));
  }, [defaultRows]);
  useEffect(() => {
    if (groupErrors) setEnabled(true);
  }, [groupErrors]);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id={toggleId}
            checked={enabled}
            onCheckedChange={setEnabled}
          />
          <Label htmlFor={toggleId}>{title}</Label>
        </div>
        {enabled && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ name: '', amount: 0, accountId: '' })}
          >
            <IconPlus />
            {t('job-add-row')}
          </Button>
        )}
      </div>
      {enabled && (
        <div className="overflow-x-auto">
          <Table className="min-w-[560px]" aria-label={title}>
            <Table.Header>
              <Table.Row>
                <Table.Head>{t('name')}</Table.Head>
                <Table.Head className="w-32">{t('amount')}</Table.Head>
                <Table.Head className="w-60">{t('account')}</Table.Head>
                <Table.Head className="w-8">
                  <span className="sr-only">{t('job-remove-row')}</span>
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
                          <Form.Label className="sr-only">
                            {t('name')}
                          </Form.Label>
                          <PopoverScoped
                            scope={`${toggleId}.${name}.${index}.name`}
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
                            scope={`${toggleId}.${name}.${index}.amount`}
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
                      aria-label={t('job-remove-group-row', {
                        group: title,
                        row: index + 1,
                      })}
                      title={t('job-remove-row')}
                      onClick={() => remove(index)}
                    >
                      <IconTrash />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
              {fields.length === 0 && (
                <Table.Row>
                  <Table.Cell
                    colSpan={4}
                    className="px-2 text-muted-foreground"
                  >
                    {t('job-no-costs')}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      )}
    </div>
  );
};
