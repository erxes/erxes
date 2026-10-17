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
import { useEffect, useMemo } from 'react';
import { UseFormReturn, useFieldArray, useWatch } from 'react-hook-form';
import { SelectProduct } from 'ui-modules';
import { TechCardCosts } from './TechCardCosts';
import { GET_TECH_CARD_PRODUCT_UNITS } from '../graphql/techCardQueries';
import { TTechCardForm } from '../types/TechCard';
import { TECH_CARD_DURATION_TYPES } from '../types/techCardFormSchema';

interface TechCardProductUnits {
  _id: string;
  uom?: string | null;
  subUoms?: { uom?: string | null }[] | null;
}

interface TechCardUnitsData {
  productsMain: { list: TechCardProductUnits[] };
  uoms: TechCardUom[];
}

interface TechCardUom {
  _id: string;
  code?: string | null;
  name?: string | null;
}

const findUnit = (uoms: TechCardUom[], value?: string) =>
  uoms.find(
    (unit) => value && [unit._id, unit.code, unit.name].includes(value),
  );

const uomToCode = (uoms: TechCardUom[], value?: string): string =>
  findUnit(uoms, value)?.code || value || '';

const uomToName = (uoms: TechCardUom[], value?: string): string =>
  findUnit(uoms, value)?.name || value || '';

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

const TechCardItems = ({
  form,
  name,
  title,
  showCostRatio,
  products,
  uoms,
  unitsLoading,
}: {
  form: UseFormReturn<TTechCardForm>;
  name: 'inputs' | 'outputs';
  title: string;
  showCostRatio?: boolean;
  products: ReadonlyMap<string, TechCardProductUnits>;
  uoms: TechCardUom[];
  unitsLoading: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const { fields, append, remove } = useFieldArray<TTechCardForm>({
    control: form.control,
    name,
  });
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
          {t('tech-card-add-row')}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[560px]" aria-label={title}>
          <Table.Header>
            <Table.Row>
              <Table.Head>{t('product')}</Table.Head>
              <Table.Head className="w-24">{t('tech-card-unit')}</Table.Head>
              <Table.Head className="w-28">{t('quantity')}</Table.Head>
              {showCostRatio && (
                <Table.Head className="w-36">
                  {t('tech-card-cost-ratio')}
                </Table.Head>
              )}
              <Table.Head className="w-8">
                <span className="sr-only">{t('tech-card-remove-row')}</span>
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
              if (savedUnit && !unitOptions.includes(savedUnit)) {
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
                  <Table.Cell className="whitespace-normal">
                    <Form.Field
                      control={form.control}
                      name={`${name}.${index}.uom`}
                      render={({ field: uomField }) => (
                        <Form.Item className="space-y-0">
                          <Form.Label className="sr-only">
                            {t('tech-card-unit')}
                          </Form.Label>
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
                            scope={`${name}.${index}.quantity`}
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
                  {showCostRatio && (
                    <Table.Cell className="whitespace-normal">
                      <Form.Field
                        control={form.control}
                        name={`${name}.${index}.costRatio`}
                        render={({ field: ratioField }) => (
                          <Form.Item className="space-y-0">
                            <Form.Label className="sr-only">
                              {t('tech-card-cost-ratio')}
                            </Form.Label>
                            <PopoverScoped
                              scope={`${name}.${index}.costRatio`}
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
                      aria-label={t('tech-card-remove-group-row', {
                        group: title,
                        row: index + 1,
                      })}
                      title={t('tech-card-remove-row')}
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

export const TechCardForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<TTechCardForm>;
  onSubmit: (data: TTechCardForm) => void;
  loading: boolean;
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
  } = useQuery<TechCardUnitsData, { ids: string[] }>(
    GET_TECH_CARD_PRODUCT_UNITS,
    {
      variables: { ids: productIds },
      skip: productIds.length === 0,
    },
  );
  const products = useMemo(
    () =>
      new Map(
        (data?.productsMain.list ?? []).map((product) => [
          product._id,
          product,
        ]),
      ),
    [data?.productsMain.list],
  );
  const uoms = useMemo(() => data?.uoms ?? [], [data?.uoms]);

  useEffect(() => {
    for (const name of ['inputs', 'outputs'] as const) {
      (form.getValues(name) ?? []).forEach((item, index) => {
        const product = products.get(item.productId);
        if (!item.uom && product?.uom) {
          form.setValue(`${name}.${index}.uom`, uomToCode(uoms, product.uom), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      });
    }
  }, [form, inputs, outputs, products, uoms]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-1 bg-background min-h-0"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
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
                  <Form.Label>{t('tech-card-production-stage')}</Form.Label>
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
                  <Form.Label>{t('tech-card-duration-type')}</Form.Label>
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
                      {TECH_CARD_DURATION_TYPES.map((value) => (
                        <Select.Item key={value} value={value}>
                          {t(`tech-card-duration-${value}`)}
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
                    <Form.Label>{t('tech-card-duration')}</Form.Label>
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

          {unitsError && productIds.length > 0 && (
            <div
              className="flex items-center gap-2 text-sm text-destructive"
              role="alert"
            >
              {t('tech-card-units-load-failed')}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void refetch()}
              >
                {t('tech-card-retry')}
              </Button>
            </div>
          )}
          <TechCardItems
            form={form}
            name="inputs"
            title={t('tech-card-input-products')}
            products={products}
            uoms={uoms}
            unitsLoading={unitsLoading}
          />
          <TechCardItems
            form={form}
            name="outputs"
            title={t('tech-card-output-products')}
            showCostRatio
            products={products}
            uoms={uoms}
            unitsLoading={unitsLoading}
          />
          <TechCardCosts
            form={form}
            name="laborCosts"
            title={t('tech-card-labor')}
          />
          <TechCardCosts
            form={form}
            name="overheadCosts"
            title={t('tech-card-overhead')}
          />
        </div>

        <Sheet.Footer className="shrink-0 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" size="lg">
              {t('cancel')}
            </Button>
          </Sheet.Close>

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
        </Sheet.Footer>
      </form>
    </Form>
  );
};
