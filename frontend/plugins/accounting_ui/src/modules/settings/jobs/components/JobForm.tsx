import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { Button, Form, Input } from 'erxes-ui';
import { ReactNode, useEffect, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';
import {
  SettingsPanelDescriptionInput,
  SettingsPanelSelect,
} from '@/settings/components/panel/SettingsPanelFields';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';
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

type JobFormProps = {
  form: UseFormReturn<TJobForm>;
  onSubmit: (data: TJobForm) => void;
  loading: boolean;
  header?: ReactNode;
  hideSettings?: boolean;
  readOnly?: boolean;
  baseUnitsOnly?: boolean;
  readOnlyCostRatio?: boolean;
} & (
  | { embedded: true; onCancel?: undefined }
  | { embedded?: false; onCancel: () => void }
);

export const JobForm = (props: JobFormProps) => {
  const {
    form,
    onSubmit,
    loading,
    header,
    hideSettings = false,
    readOnly = false,
    embedded,
    baseUnitsOnly = false,
    readOnlyCostRatio = false,
  } = props;
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

  const unitsBlocked =
    unitsLoading || (productIds.length > 0 && Boolean(unitsError));

  const content = (
    <fieldset
      disabled={readOnly || (baseUnitsOnly && unitsLoading)}
      className="min-w-0 space-y-5"
    >
      {header}
      {!hideSettings && (
        <div className="flex flex-col gap-1">
          <Form.Field
            control={form.control}
            name="code"
            render={({ field, fieldState }) => (
              <PanelFormRow label={t('code')} error={fieldState.error?.message}>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  autoComplete="off"
                  className={PANEL_INPUT_CLASS_NAME}
                />
              </PanelFormRow>
            )}
          />

          <Form.Field
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('job-production-stage')}
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  autoFocus
                  autoComplete="off"
                  className={PANEL_INPUT_CLASS_NAME}
                />
              </PanelFormRow>
            )}
          />

          <Form.Field
            control={form.control}
            name="durationType"
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('job-duration-type')}
                error={fieldState.error?.message}
              >
                <SettingsPanelSelect
                  value={field.value}
                  placeholder={t('job-duration-type')}
                  options={JOB_DURATION_TYPES.map((value) => ({
                    value,
                    label: t(`job-duration-${value}`),
                  }))}
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === 'real') {
                      form.setValue('duration', undefined, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  className={PANEL_INPUT_CLASS_NAME}
                />
              </PanelFormRow>
            )}
          />

          {durationType !== 'real' && (
            <Form.Field
              control={form.control}
              name="duration"
              render={({ field, fieldState }) => (
                <PanelFormRow
                  label={t('job-duration')}
                  error={fieldState.error?.message}
                >
                  <JobNumberInput
                    value={field.value}
                    min={0}
                    onChange={field.onChange}
                    className={PANEL_INPUT_CLASS_NAME}
                  />
                </PanelFormRow>
              )}
            />
          )}

          <Form.Field
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('status')}
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  value={field.value ?? ''}
                  autoComplete="off"
                  className={PANEL_INPUT_CLASS_NAME}
                />
              </PanelFormRow>
            )}
          />

          {!embedded && (
            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <SettingsPanelDescriptionInput
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )}
            />
          )}
        </div>
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
      <JobCosts form={form} name="overheadCosts" title={t('job-overhead')} />
    </fieldset>
  );

  if (props.embedded) {
    return (
      <Form {...form}>
        <div className="flex flex-col flex-1 bg-background min-h-0">
          {content}
        </div>
      </Form>
    );
  }

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={onSubmit}
      onCancel={props.onCancel}
      saving={loading || unitsBlocked}
    >
      {content}
    </SettingsPanelDraftForm>
  );
};
