import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import {
  Button,
  Form,
  Input,
  Select,
  Sheet,
  Spinner,
  Textarea,
} from 'erxes-ui';
import { ReactNode, useEffect, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { JobCosts } from './JobCosts';
import { JobItems } from '@/settings/jobs/components/JobItems';
import { JobNumberInput } from '@/settings/jobs/components/JobNumberInput';
import { GET_JOB_PRODUCT_UNITS } from '../graphql/jobQueries';
import { TJobForm } from '../types/Job';
import { JOB_DURATION_TYPES } from '../types/jobFormSchema';
import {
  jobItemInBaseUnits,
  jobSubUomsSchema,
  uomToCode,
} from '../utils/jobUnits';

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
                        <JobNumberInput
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
