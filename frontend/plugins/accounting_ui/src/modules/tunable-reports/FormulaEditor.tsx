import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useFieldArray, useWatch } from 'react-hook-form';
import { Button, Form, Spinner, Input } from 'erxes-ui';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  ReportForm,
  ChoiceSetting,
  TextSetting,
  PeriodSettings,
  Choice,
} from '@/tunable-reports/fields';
import { reportId as makeReportId } from '@/tunable-reports/values';
import { REPORT_DETAIL, REPORT_LIST } from '@/tunable-reports/graphql';
import { useReportTranslation } from '@/tunable-reports/locales';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { SelectAccountCategory } from '@/settings/account/account-categories/components/SelectAccountCategory';

const ReferenceFields = ({
  form,
  sectionIndex,
  formulaIndex,
  operand,
  reportId: currentReportId,
}: {
  form: ReportForm;
  sectionIndex: number;
  formulaIndex: number;
  operand: 'source' | 'ratioSource';
  reportId?: string;
}) => {
  const { t } = useReportTranslation();
  const path =
    `sections.${sectionIndex}.formulas.${formulaIndex}.${operand}` as const;
  const source = useWatch({ control: form.control, name: path });
  const sections = useWatch({ control: form.control, name: 'sections' });
  const [searchValue, setSearchValue] = useState('');
  const list = useQuery(REPORT_LIST, {
    variables: { page: 1, perPage: 100, searchValue },
  });
  const external = !!source?.reportId && source.reportId !== currentReportId;
  const detail = useQuery(REPORT_DETAIL, {
    variables: { _id: source?.reportId || '' },
    skip: !external,
  });
  const sourceSections = external
    ? detail.data?.accountingTunableReportDetail.sections ?? []
    : sections;
  const sourceSection = sourceSections.find(
    (section) =>
      section._id === (source?.sectionId || sections[sectionIndex]?._id),
  );
  const setSource = (reportId?: string, sectionId?: string) =>
    form.setValue(
      path,
      { reportId, sectionId, rowId: '' },
      { shouldDirty: true },
    );
  return (
    <div className="space-y-3 rounded-lg border p-3">
      <h3 className="text-sm font-semibold">
        {t(operand === 'source' ? 'source' : 'ratioSource')}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm">{t('sourceReport')}</p>
          <Input
            aria-label={t('search')}
            placeholder={t('search')}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <Choice
            label={t('sourceReport')}
            value={source?.reportId || '__inherit'}
            options={[
              { value: '__inherit', label: t('sameReport') },
              ...(list.data?.accountingTunableReports.list ?? [])
                .filter((report) => report._id !== currentReportId)
                .map((report) => ({
                  value: report._id,
                  label: `${report.code} ${report.name}`,
                })),
            ]}
            onChange={(id) =>
              setSource(id === '__inherit' ? undefined : id, undefined)
            }
          />
          {list.loading && <Spinner size="sm" />}
          {list.error && <p role="alert">{list.error.message}</p>}
        </div>
        <div className="space-y-2">
          <p className="text-sm">{t('sourceSection')}</p>
          <Choice
            label={t('sourceSection')}
            value={source?.sectionId || '__inherit'}
            options={[
              ...(!external
                ? [{ value: '__inherit', label: t('sameSection') }]
                : []),
              ...sourceSections.map((section) => ({
                value: section._id,
                label: section.name || t('section'),
              })),
            ]}
            onChange={(id) =>
              setSource(source?.reportId, id === '__inherit' ? undefined : id)
            }
          />
          {detail.loading && <Spinner size="sm" />}
          {detail.error && <p role="alert">{detail.error.message}</p>}
        </div>
        <ChoiceSetting
          form={form}
          name={`${path}.rowId`}
          label={t('source')}
          options={(sourceSection?.rows ?? []).map((row) => ({
            value: row._id,
            label: `${row.number || ''} ${row.name || t('formulaRow')}`,
          }))}
        />
        <ChoiceSetting
          form={form}
          name={`${path}.columnId`}
          label={t('sourceColumn')}
          options={[
            { value: '__inherit', label: t('periodContext') },
            ...(sourceSection?.columns ?? []).map((column) => ({
              value: column._id,
              label: column.name || t('columns'),
            })),
          ]}
        />
      </div>
    </div>
  );
};
const AccountSetting = ({
  form,
  name,
  label,
  category = false,
}: {
  form: ReportForm;
  name: `sections.${number}.formulas.${number}.${
    | 'debitAccountId'
    | 'creditAccountId'
    | 'debitAccountCategoryId'
    | 'creditAccountCategoryId'}`;
  label: string;
  category?: boolean;
}) => {
  const { t } = useReportTranslation();
  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <div className="flex gap-1">
            {category ? (
              <SelectAccountCategory
                selected={field.value}
                recordId={name}
                nullable
                onSelect={(value) => field.onChange(value || undefined)}
              />
            ) : (
              <SelectAccount.FormItem
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(typeof value === 'string' ? value : value[0])
                }
              />
            )}
            {field.value && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t('cancel')}
                onClick={() => field.onChange(undefined)}
              >
                ×
              </Button>
            )}
          </div>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
const FormulaSettings = ({
  form,
  sectionIndex,
  formulaIndex,
  reportId,
}: {
  form: ReportForm;
  sectionIndex: number;
  formulaIndex: number;
  reportId?: string;
}) => {
  const { t } = useReportTranslation();
  const path = `sections.${sectionIndex}.formulas.${formulaIndex}` as const;
  const formula = useWatch({ control: form.control, name: path });
  if (!formula) return null;
  return (
    <div className="space-y-4 p-4">
      <p className="text-sm text-muted-foreground">{t('periodHelp')}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <ChoiceSetting
          form={form}
          name={`${path}.kind`}
          label={t('kind')}
          options={['balance', 'transaction', 'from_row', 'ratio'].map(
            (value) => ({ value, label: t(value) }),
          )}
          onChange={(kind) => {
            if (kind === 'balance' || kind === 'transaction') {
              form.setValue(`${path}.source`, undefined, { shouldDirty: true });
              form.setValue(`${path}.ratioSource`, undefined, {
                shouldDirty: true,
              });
            } else {
              for (const field of [
                'debitAccountId',
                'creditAccountId',
                'debitAccountCategoryId',
                'creditAccountCategoryId',
              ] as const)
                form.setValue(`${path}.${field}`, undefined, {
                  shouldDirty: true,
                });
              if (kind === 'from_row')
                form.setValue(`${path}.ratioSource`, undefined, {
                  shouldDirty: true,
                });
            }
          }}
        />
        <TextSetting
          form={form}
          name={`${path}.percent`}
          label={t('percent')}
        />
        <Form.Field
          control={form.control}
          name={`${path}.plusOrMinus`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('operation')}</Form.Label>
              <Choice
                label={t('operation')}
                value={field.value ? 'add' : 'subtract'}
                onChange={(value) => field.onChange(value === 'add')}
                options={[
                  { value: 'add', label: t('addValue') },
                  { value: 'subtract', label: t('subtractValue') },
                ]}
              />
            </Form.Item>
          )}
        />
        <ChoiceSetting
          form={form}
          name={`${path}.valueSide`}
          label={t('valueSide')}
          options={['__inherit', 'debit', 'credit'].map((value) => ({
            value,
            label: t(value === '__inherit' ? 'inherit' : value),
          }))}
        />
      </div>
      <PeriodSettings form={form} path={path} />
      {(formula.kind === 'balance' || formula.kind === 'transaction') && (
        <div className="grid gap-3 sm:grid-cols-2">
          <AccountSetting
            form={form}
            name={`${path}.debitAccountId`}
            label={t('debitAccount')}
          />
          <AccountSetting
            form={form}
            name={`${path}.creditAccountId`}
            label={t('creditAccount')}
          />
          <AccountSetting
            form={form}
            name={`${path}.debitAccountCategoryId`}
            label={t('debitCategory')}
            category
          />
          <AccountSetting
            form={form}
            name={`${path}.creditAccountCategoryId`}
            label={t('creditCategory')}
            category
          />
        </div>
      )}
      {(formula.kind === 'from_row' || formula.kind === 'ratio') && (
        <ReferenceFields
          form={form}
          sectionIndex={sectionIndex}
          formulaIndex={formulaIndex}
          operand="source"
          reportId={reportId}
        />
      )}
      {formula.kind === 'ratio' && (
        <>
          <ChoiceSetting
            form={form}
            name={`${path}.ratioRule`}
            label={t('operation')}
            options={['divide', 'multiply'].map((value) => ({
              value,
              label: t(value),
            }))}
          />
          <ReferenceFields
            form={form}
            sectionIndex={sectionIndex}
            formulaIndex={formulaIndex}
            operand="ratioSource"
            reportId={reportId}
          />
        </>
      )}
    </div>
  );
};

export const FormulaCellEditor = ({
  form,
  sectionIndex,
  reportId,
  target,
}: {
  form: ReportForm;
  sectionIndex: number;
  reportId?: string;
  target: { rowId: string; columnId: string };
}) => {
  const { t } = useReportTranslation();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `sections.${sectionIndex}.formulas`,
  });
  const section = useWatch({
    control: form.control,
    name: `sections.${sectionIndex}`,
  });
  const matching = fields
    .map((field, index) => ({
      id: field._id,
      index,
      formula: section.formulas[index],
    }))
    .filter(
      ({ formula }) =>
        formula.rowId === target.rowId &&
        (section.formulaType === 'row' || formula.columnId === target.columnId),
    );
  const [selected, setSelected] = useState<string>();
  const current = matching.find((item) => item.id === selected) || matching[0];
  const errors = form.formState.errors.sections?.[sectionIndex]?.formulas;
  useEffect(() => {
    if (!errors) return;
    const invalid = fields.findIndex(
      (field, index) =>
        errors[index] &&
        field.rowId === target.rowId &&
        (section.formulaType === 'row' || field.columnId === target.columnId),
    );
    if (invalid >= 0) setSelected(fields[invalid]._id);
  }, [errors, fields, target.rowId, target.columnId, section.formulaType]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-4 pt-4">
        {matching.length > 0 && (
          <div className="min-w-0 flex-1">
            <Choice
              label={t('formulas')}
              value={current?.id}
              onChange={setSelected}
              options={matching.map((item, index) => ({
                value: item.id,
                label: `${index + 1}. ${
                  item.formula.plusOrMinus ? '+' : '−'
                } ${t(item.formula.kind)} · ${item.formula.percent}%`,
              }))}
            />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const _id = makeReportId();
            const column = section.columns.find(
              (column) => column._id === target.columnId,
            );
            append({
              _id,
              rowId: target.rowId,
              columnId:
                section.formulaType === 'cell' ? target.columnId : undefined,
              kind: column?.getDate === 'between' ? 'transaction' : 'balance',
              plusOrMinus: true,
              percent: '100',
              ratioRule: 'divide',
            });
            setSelected(_id);
          }}
        >
          <IconPlus />
          {t('addFormula')}
        </Button>
        {current && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('remove')}
            onClick={() => {
              remove(current.index);
              setSelected(undefined);
            }}
          >
            <IconTrash />
          </Button>
        )}
      </div>
      {!current && (
        <p className="px-4 pb-4 text-sm text-muted-foreground">
          {t('noFormulas')}
        </p>
      )}
      {current && (
        <FormulaSettings
          key={current.id}
          form={form}
          sectionIndex={sectionIndex}
          formulaIndex={current.index}
          reportId={reportId}
        />
      )}
    </div>
  );
};
