import { useTranslation } from 'react-i18next';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Form,
  PopoverScoped,
  RecordTableInlineCell,
  Select,
  Spinner,
  Table,
} from 'erxes-ui';
import { useId } from 'react';
import { UseFormReturn, useFieldArray, useWatch } from 'react-hook-form';
import { SelectProduct } from 'ui-modules';
import { TJobForm } from '@/settings/jobs/types/Job';
import { JobNumberInput } from '@/settings/jobs/components/JobNumberInput';
import {
  JobProductUnits,
  JobUom,
  uomToCode,
  uomToName,
} from '@/settings/jobs/utils/jobUnits';

export const JobItems = ({
  form,
  name,
  title,
  showCostRatio,
  products,
  uoms,
  unitsLoading,
  baseUnitsOnly,
  readOnlyCostRatio = false,
}: {
  form: UseFormReturn<TJobForm>;
  name: 'inputs' | 'outputs';
  title: string;
  showCostRatio?: boolean;
  products: ReadonlyMap<string, JobProductUnits>;
  uoms: JobUom[];
  unitsLoading: boolean;
  baseUnitsOnly: boolean;
  readOnlyCostRatio?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const { fields, append, remove } = useFieldArray<TJobForm>({
    control: form.control,
    name,
  });
  const scopeId = useId();
  const items = useWatch({ control: form.control, name });

  const addItem = () =>
    append({
      productId: '',
      uom: '',
      quantity: 1,
      costRatio: showCostRatio ? 1 : undefined,
    });

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <Form.Label>{title}</Form.Label>
        <Button type="button" variant="secondary" size="sm" onClick={addItem}>
          <IconPlus />
          {t('job-add-row')}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[560px]" aria-label={title}>
          <Table.Header>
            <Table.Row>
              <Table.Head>{t('product')}</Table.Head>
              {showCostRatio && readOnlyCostRatio && (
                <Table.Head className="w-20 whitespace-normal">
                  {t('job-cost-ratio')}
                </Table.Head>
              )}
              <Table.Head className="w-24">{t('job-unit')}</Table.Head>
              <Table.Head className="w-28">{t('quantity')}</Table.Head>
              {showCostRatio && !readOnlyCostRatio && (
                <Table.Head className="w-36">{t('job-cost-ratio')}</Table.Head>
              )}
              <Table.Head className="w-8">
                <span className="sr-only">{t('job-remove-row')}</span>
              </Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fields.map((field, index) => {
              const product = products.get(items?.[index]?.productId);
              const unitOptions = Array.from(
                new Set(
                  [
                    product?.uom,
                    ...(product?.subUoms ?? []).map((unit) => unit.uom),
                  ]
                    .map((unit) => uomToCode(uoms, unit ?? ''))
                    .filter(Boolean),
                ),
              );
              const savedUnit = uomToCode(uoms, items?.[index]?.uom);
              if (
                !baseUnitsOnly &&
                savedUnit &&
                !unitOptions.includes(savedUnit)
              ) {
                unitOptions.push(savedUnit);
              }
              return (
                <Table.Row
                  key={field.id}
                  className="h-cell hover:bg-background!"
                >
                  <Table.Cell className="whitespace-normal">
                    <Form.Field
                      control={form.control}
                      name={`${name}.${index}.productId`}
                      render={({ field: productField }) => (
                        <Form.Item className="space-y-0">
                          <Form.Label className="sr-only">
                            {t('product')}
                          </Form.Label>
                          <SelectProduct
                            mode="single"
                            value={productField.value}
                            onValueChange={(value) => {
                              if (value === productField.value) return;
                              productField.onChange(value);
                              form.setValue(`${name}.${index}.uom`, '', {
                                shouldDirty: true,
                              });
                            }}
                            variant="ghost"
                          />
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </Table.Cell>
                  {showCostRatio && readOnlyCostRatio && (
                    <Table.Cell>
                      <RecordTableInlineCell>
                        {items?.[index]?.costRatio?.toLocaleString() ?? '-'}
                      </RecordTableInlineCell>
                    </Table.Cell>
                  )}
                  <Table.Cell className="whitespace-normal">
                    <Form.Field
                      control={form.control}
                      name={`${name}.${index}.uom`}
                      render={({ field: uomField }) => (
                        <Form.Item className="space-y-0">
                          <Form.Label className="sr-only">
                            {t('job-unit')}
                          </Form.Label>
                          {baseUnitsOnly ? (
                            <RecordTableInlineCell>
                              {unitsLoading ? (
                                <Spinner />
                              ) : (
                                uomToName(uoms, product?.uom) || '-'
                              )}
                            </RecordTableInlineCell>
                          ) : (
                            <Select
                              value={uomToCode(uoms, uomField.value)}
                              onValueChange={uomField.onChange}
                              disabled={
                                unitsLoading ||
                                !product ||
                                unitOptions.length === 0
                              }
                            >
                              <Form.Control>
                                <Select.Trigger className="h-cell rounded-none shadow-none px-2">
                                  <Select.Value placeholder="-" />
                                </Select.Trigger>
                              </Form.Control>
                              <Select.Content>
                                {unitOptions.map((unit) => (
                                  <Select.Item key={unit} value={unit}>
                                    {uomToName(uoms, unit)}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select>
                          )}
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </Table.Cell>
                  <Table.Cell className="whitespace-normal">
                    <Form.Field
                      control={form.control}
                      name={`${name}.${index}.quantity`}
                      render={({ field: quantityField }) => (
                        <Form.Item className="space-y-0">
                          <Form.Label className="sr-only">
                            {t('quantity')}
                          </Form.Label>
                          <PopoverScoped
                            scope={`${scopeId}.${name}.${index}.quantity`}
                            closeOnEnter
                          >
                            <Form.Control>
                              <RecordTableInlineCell.Trigger>
                                {quantityField.value?.toLocaleString() ?? '-'}
                              </RecordTableInlineCell.Trigger>
                            </Form.Control>
                            <RecordTableInlineCell.Content>
                              <JobNumberInput
                                value={quantityField.value}
                                min={0}
                                onChange={quantityField.onChange}
                              />
                            </RecordTableInlineCell.Content>
                          </PopoverScoped>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </Table.Cell>
                  {showCostRatio && !readOnlyCostRatio && (
                    <Table.Cell className="whitespace-normal">
                      <Form.Field
                        control={form.control}
                        name={`${name}.${index}.costRatio`}
                        render={({ field: ratioField }) => (
                          <Form.Item className="space-y-0">
                            <Form.Label className="sr-only">
                              {t('job-cost-ratio')}
                            </Form.Label>
                            <PopoverScoped
                              scope={`${scopeId}.${name}.${index}.costRatio`}
                              closeOnEnter
                            >
                              <Form.Control>
                                <RecordTableInlineCell.Trigger>
                                  {ratioField.value?.toLocaleString() ?? '-'}
                                </RecordTableInlineCell.Trigger>
                              </Form.Control>
                              <RecordTableInlineCell.Content>
                                <JobNumberInput
                                  value={ratioField.value}
                                  min={0}
                                  onChange={ratioField.onChange}
                                />
                              </RecordTableInlineCell.Content>
                            </PopoverScoped>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />
                    </Table.Cell>
                  )}
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
                      disabled={fields.length === 1}
                    >
                      <IconTrash />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
      <Form.Field
        control={form.control}
        name={name}
        render={() => <Form.Message />}
      />
    </div>
  );
};
