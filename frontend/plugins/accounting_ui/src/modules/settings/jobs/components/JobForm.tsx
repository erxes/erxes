import { useTranslation } from 'react-i18next';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import {
  Button,
  Form,
  Input,
  PopoverScoped,
  RecordTableInlineCell,
  Select,
  Sheet,
  Spinner,
  Table,
  Textarea,
} from 'erxes-ui';
import { ReactNode, useEffect, useId, useMemo } from 'react';
import { UseFormReturn, useFieldArray, useWatch } from 'react-hook-form';
import { SelectProduct } from 'ui-modules';
import { JobCosts } from './JobCosts';
import { GET_JOB_PRODUCT_UNITS } from '../graphql/jobQueries';
import { TJobForm } from '../types/Job';
import { JOB_DURATION_TYPES } from '../types/jobFormSchema';
import {
  JobProductUnits,
  JobUom,
  jobItemInBaseUnits,
  jobSubUomsSchema,
  uomToCode,
  uomToName,
} from '../utils/jobUnits';

const numberValue = (value: string) =>
  value === '' ? undefined : Number(value);

const NumberInput = ({
  value,
  onChange,
  min,
  max,
}: {
  value?: number;
  onChange: (value?: number) => void;
  min?: number;
  max?: number;
}) => (
  <Input
    type="number"
    value={value ?? ''}
    min={min}
    max={max}
    onChange={(event) => onChange(numberValue(event.target.value))}
  />
);

const JobItems = ({
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
                              <NumberInput
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
                                <NumberInput
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

export const JobForm = ({
  form,
  onSubmit,
  loading,
  header,
  hideSettings = false,
  readOnly = false,
  onInvalid,
  embedded = false,
  baseUnitsOnly = false,
  readOnlyCostRatio = false,
}: {
  form: UseFormReturn<TJobForm>;
  onSubmit: (data: TJobForm) => void;
  loading: boolean;
  header?: ReactNode;
  hideSettings?: boolean;
  readOnly?: boolean;
  onInvalid?: () => void;
  embedded?: boolean;
  baseUnitsOnly?: boolean;
  readOnlyCostRatio?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const [inputs, outputs] = useWatch({
    control: form.control,
    name: ['inputs', 'outputs'],
  });
  const durationType = useWatch({
    control: form.control,
    name: 'durationType',
  });
  const productIds = useMemo(
    () =>
      Array.from(
        new Set(
          [...(inputs ?? []), ...(outputs ?? [])]
            .map((item) => item.productId)
            .filter(Boolean),
        ),
      ),
    [inputs, outputs],
  );
  const {
    data,
    loading: unitsLoading,
    error: unitsError,
    refetch,
  } = useQuery(GET_JOB_PRODUCT_UNITS, {
    variables: { ids: productIds },
    skip: productIds.length === 0,
  });
  const products = useMemo(
    () =>
      new Map(
        (data?.productsMain?.list ?? []).flatMap((product) =>
          product
            ? [
                [
                  product._id,
                  {
                    ...product,
                    subUoms: jobSubUomsSchema.parse(product.subUoms),
                  },
                ] as const,
              ]
            : [],
        ),
      ),
    [data?.productsMain?.list],
  );
  const uoms = useMemo(
    () => (data?.uoms ?? []).filter((unit) => unit !== null),
    [data?.uoms],
  );

  useEffect(() => {
    for (const name of ['inputs', 'outputs'] as const) {
      (form.getValues(name) ?? []).forEach((item, index) => {
        const product = products.get(item.productId);
        if (baseUnitsOnly && product) {
          if (!Number.isFinite(item.quantity) || item.quantity <= 0) return;
          try {
            const converted = jobItemInBaseUnits(item, product, uoms);
            if (
              converted.uom !== item.uom ||
              converted.quantity !== item.quantity
            ) {
              form.setValue(`${name}.${index}`, converted, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }
          } catch {
            const path = `${name}.${index}.uom` as const;
            if (form.getFieldState(path).error?.type !== 'unitConversion') {
              form.setError(path, {
                type: 'unitConversion',
                message: t('job-units-load-failed'),
              });
            }
          }
          return;
        }
        if (!item.uom && product?.uom) {
          form.setValue(`${name}.${index}.uom`, uomToCode(uoms, product.uom), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      });
    }
  }, [form, inputs, outputs, products, uoms, baseUnitsOnly, t]);

  const Container = embedded ? 'div' : 'form';
  return (
    <Form {...form}>
      <Container
        onSubmit={embedded ? undefined : form.handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col flex-1 bg-background min-h-0"
      >
        <fieldset
          disabled={readOnly || (baseUnitsOnly && unitsLoading)}
          className={
            embedded
              ? 'space-y-5'
              : 'flex-1 min-h-0 overflow-y-auto p-5 space-y-5'
          }
        >
          {header}
          {!hideSettings && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Form.Field
                control={form.control}
                name="code"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('code')}</Form.Label>
                    <Form.Control>
                      <Input {...field} value={field.value ?? ''} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item className="md:col-span-2">
                    <Form.Label>{t('job-production-stage')}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="durationType"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('job-duration-type')}</Form.Label>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === 'real') {
                          form.setValue('duration', undefined, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {JOB_DURATION_TYPES.map((value) => (
                          <Select.Item key={value} value={value}>
                            {t(`job-duration-${value}`)}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {durationType !== 'real' && (
                <Form.Field
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('job-duration')}</Form.Label>
                      <Form.Control>
                        <NumberInput
                          value={field.value}
                          min={0}
                          onChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}

              <Form.Field
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('status')}</Form.Label>
                    <Form.Control>
                      <Input {...field} value={field.value ?? ''} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          )}

          {!embedded && (
            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('description')}</Form.Label>
                  <Form.Control>
                    <Textarea {...field} value={field.value ?? ''} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          )}

          {unitsError && productIds.length > 0 && (
            <div
              className="flex items-center gap-2 text-sm text-destructive"
              role="alert"
            >
              {t('job-units-load-failed')}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void refetch()}
              >
                {t('job-retry')}
              </Button>
            </div>
          )}
          <JobItems
            form={form}
            name="inputs"
            title={t('job-input-products')}
            products={products}
            uoms={uoms}
            unitsLoading={unitsLoading}
            baseUnitsOnly={baseUnitsOnly}
          />
          <JobItems
            form={form}
            name="outputs"
            title={t('job-output-products')}
            showCostRatio
            readOnlyCostRatio={readOnlyCostRatio}
            products={products}
            uoms={uoms}
            unitsLoading={unitsLoading}
            baseUnitsOnly={baseUnitsOnly}
          />
          <JobCosts form={form} name="laborCosts" title={t('job-labor')} />
          <JobCosts
            form={form}
            name="overheadCosts"
            title={t('job-overhead')}
          />
        </fieldset>

        {!embedded && (
          <Sheet.Footer className="shrink-0 border-t bg-background">
            <Sheet.Close asChild>
              <Button variant="outline" size="lg">
                {t('cancel')}
              </Button>
            </Sheet.Close>

            {!readOnly && (
              <Button
                type="submit"
                disabled={
                  loading ||
                  unitsLoading ||
                  (productIds.length > 0 && Boolean(unitsError))
                }
                size="lg"
              >
                {loading ? <Spinner /> : t('save')}
              </Button>
            )}
          </Sheet.Footer>
        )}
      </Container>
    </Form>
  );
};
