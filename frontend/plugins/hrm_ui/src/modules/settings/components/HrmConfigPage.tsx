import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, Spinner, toast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { HRM_CONFIGS_UPDATE_BY_CODE } from '../graphql/mutations/configs';
import { HRM_CONFIGS_BY_CODE } from '../graphql/queries/configs';
import { HrmSettingsLayout } from './HrmSettingsLayout';

const CONFIG_CODES = [
  'payrollMainCurrency',
  'defaultWorkingDays',
  'defaultWorkingHours',
  'salaryPayableAccountId',
  'salaryExpenseAccountId',
  'taxPayableAccountId',
  'contributionPayableAccountId',
] as const;

const schema = z.object({
  payrollMainCurrency: z.string().min(1),
  defaultWorkingDays: z.coerce.number().min(0),
  defaultWorkingHours: z.coerce.number().min(0),
  salaryPayableAccountId: z.string().optional(),
  salaryExpenseAccountId: z.string().optional(),
  taxPayableAccountId: z.string().optional(),
  contributionPayableAccountId: z.string().optional(),
});

type HrmMainConfigValues = z.infer<typeof schema>;

const defaultValues: HrmMainConfigValues = {
  payrollMainCurrency: 'MNT',
  defaultWorkingDays: 22,
  defaultWorkingHours: 176,
  salaryPayableAccountId: '',
  salaryExpenseAccountId: '',
  taxPayableAccountId: '',
  contributionPayableAccountId: '',
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Тохиргоо хадгалахад алдаа гарлаа';

const toConfigValues = (
  values?: Partial<Record<(typeof CONFIG_CODES)[number], unknown>>,
): HrmMainConfigValues => ({
  payrollMainCurrency:
    typeof values?.payrollMainCurrency === 'string'
      ? values.payrollMainCurrency
      : defaultValues.payrollMainCurrency,
  defaultWorkingDays: Number(
    values?.defaultWorkingDays ?? defaultValues.defaultWorkingDays,
  ),
  defaultWorkingHours: Number(
    values?.defaultWorkingHours ?? defaultValues.defaultWorkingHours,
  ),
  salaryPayableAccountId:
    typeof values?.salaryPayableAccountId === 'string'
      ? values.salaryPayableAccountId
      : defaultValues.salaryPayableAccountId,
  salaryExpenseAccountId:
    typeof values?.salaryExpenseAccountId === 'string'
      ? values.salaryExpenseAccountId
      : defaultValues.salaryExpenseAccountId,
  taxPayableAccountId:
    typeof values?.taxPayableAccountId === 'string'
      ? values.taxPayableAccountId
      : defaultValues.taxPayableAccountId,
  contributionPayableAccountId:
    typeof values?.contributionPayableAccountId === 'string'
      ? values.contributionPayableAccountId
      : defaultValues.contributionPayableAccountId,
});

export const HrmConfigPage = () => {
  const { data, loading, refetch } = useQuery<{
    hrmConfigsByCode?: Partial<Record<(typeof CONFIG_CODES)[number], unknown>>;
  }>(HRM_CONFIGS_BY_CODE, {
    variables: { codes: CONFIG_CODES },
  });
  const [saveConfigs, saveState] = useMutation(HRM_CONFIGS_UPDATE_BY_CODE);
  const form = useForm<HrmMainConfigValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    const values = data?.hrmConfigsByCode;

    if (!values) {
      return;
    }

    form.reset(toConfigValues(values));
  }, [data, form]);

  const onSubmit = async (values: HrmMainConfigValues) => {
    try {
      await saveConfigs({ variables: { configsMap: values } });
      await refetch();
      toast({ title: 'Амжилттай', description: 'HRM тохиргоо хадгалагдлаа' });
    } catch (error) {
      toast({ title: 'Алдаа', description: getErrorMessage(error) });
    }
  };

  return (
    <HrmSettingsLayout
      actions={
        <Button
          type="submit"
          form="hrm-main-config-form"
          disabled={saveState.loading}
        >
          {saveState.loading ? 'Хадгалж байна' : 'Хадгалах'}
        </Button>
      }
    >
      <form
        id="hrm-main-config-form"
        className="max-w-3xl space-y-5 p-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <h2 className="text-lg font-semibold">HRM үндсэн тохиргоо</h2>
          <p className="text-sm text-muted-foreground">
            Payroll болон accounting preview-д ашиглах системийн тохиргоо.
          </p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="sm" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <ConfigField
              label="Үндсэн валют"
              name="payrollMainCurrency"
              register={form.register}
            />
            <ConfigField
              label="Ажлын өдөр"
              name="defaultWorkingDays"
              type="number"
              register={form.register}
            />
            <ConfigField
              label="Ажлын цаг"
              name="defaultWorkingHours"
              type="number"
              register={form.register}
            />
            <ConfigField
              label="Цалингийн өглөгийн данс"
              name="salaryPayableAccountId"
              register={form.register}
            />
            <ConfigField
              label="Цалингийн зардлын данс"
              name="salaryExpenseAccountId"
              register={form.register}
            />
            <ConfigField
              label="Татварын өглөгийн данс"
              name="taxPayableAccountId"
              register={form.register}
            />
            <ConfigField
              label="Шимтгэлийн өглөгийн данс"
              name="contributionPayableAccountId"
              register={form.register}
            />
          </div>
        )}
      </form>
    </HrmSettingsLayout>
  );
};

const ConfigField = ({
  label,
  name,
  type,
  register,
}: {
  label: string;
  name: keyof HrmMainConfigValues;
  type?: 'text' | 'number';
  register: ReturnType<typeof useForm<HrmMainConfigValues>>['register'];
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={name}>{label}</Label>
    <Input id={name} type={type || 'text'} {...register(name)} />
  </div>
);
