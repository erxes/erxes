import { useEffect, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { Button, Table, Tabs } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { ReportForm } from '@/tunable-reports/fields';
import { FormulaRow } from '@/tunable-reports/FormulaRow';
import {
  FORMULA_KINDS,
  FormulaKind,
  FORMULA_TABLE_WIDTHS,
  getFormulaColumns,
  getFormulaHeaderGroups,
} from '@/tunable-reports/formulaColumns';
import { reportId as makeReportId } from '@/tunable-reports/values';
import { useReportTranslation } from '@/tunable-reports/locales';

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
  const watchedFormulas = new Map(
    section.formulas.map((formula) => [formula._id, formula]),
  );
  const matching = fields
    .map((field, index) => ({
      id: field._id,
      index,
      formula: watchedFormulas.get(field._id) ?? field,
    }))
    .filter(
      ({ formula }) =>
        formula.rowId === target.rowId &&
        (section.formulaType === 'row' || formula.columnId === target.columnId),
    );
  const column = section.columns.find(
    (column) => column._id === target.columnId,
  );
  const [kind, setKind] = useState<FormulaKind>(
    matching[0]?.formula.kind ??
      (column?.getDate === 'between' ? 'transaction' : 'balance'),
  );
  const errors = form.formState.errors.sections?.[sectionIndex]?.formulas;
  useEffect(() => {
    const invalid = fields.findIndex(
      (field, index) =>
        errors?.[index] &&
        field.rowId === target.rowId &&
        (section.formulaType === 'row' || field.columnId === target.columnId),
    );
    if (invalid >= 0) setKind(fields[invalid].kind);
  }, [errors, fields, target.rowId, target.columnId, section.formulaType]);
  const headers = getFormulaColumns(kind, t);
  const headerGroups = getFormulaHeaderGroups(headers);
  const grouped = headerGroups.length < headers.length;
  const rows = matching.filter((item) => item.formula.kind === kind);
  return (
    <div className="min-w-0 space-y-4 p-4">
      <Tabs
        value={kind}
        onValueChange={(value) => {
          const nextKind = FORMULA_KINDS.find((item) => item === value);
          if (nextKind) setKind(nextKind);
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs.List className="flex flex-wrap">
            {FORMULA_KINDS.map((value) => (
              <Tabs.Trigger key={value} value={value}>
                {t(value)} (
                {matching.filter((item) => item.formula.kind === value).length})
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              append({
                _id: makeReportId(),
                rowId: target.rowId,
                columnId:
                  section.formulaType === 'cell' ? target.columnId : undefined,
                kind,
                plusOrMinus: true,
                percent: '100',
                ratioRule: 'divide',
              })
            }
          >
            <IconPlus />
            {t('addFormula')}
          </Button>
        </div>
        <Tabs.Content value={kind} className="pt-3">
          <div className="relative overflow-x-auto">
            <Table className={FORMULA_TABLE_WIDTHS[kind]}>
              <Table.Header>
                <Table.Row>
                  <Table.Head
                    rowSpan={grouped ? 2 : undefined}
                    className="sticky left-0 z-20 w-10"
                  >
                    <span className="sr-only">{t('remove')}</span>
                  </Table.Head>
                  {headerGroups.map((item) =>
                    'span' in item ? (
                      <Table.Head
                        key={item.key}
                        colSpan={item.span}
                        className="border-x text-center"
                      >
                        {item.label}
                      </Table.Head>
                    ) : (
                      <Table.Head
                        key={item.key}
                        rowSpan={grouped ? 2 : undefined}
                        className={item.className}
                      >
                        {item.label}
                      </Table.Head>
                    ),
                  )}
                </Table.Row>
                {grouped && (
                  <Table.Row>
                    {headers
                      .filter((column) => column.group)
                      .map(({ key, label, className }) => (
                        <Table.Head key={key} className={className}>
                          {label}
                        </Table.Head>
                      ))}
                  </Table.Row>
                )}
              </Table.Header>
              <Table.Body>
                {rows.map((item) => (
                  <FormulaRow
                    key={item.id}
                    form={form}
                    sectionIndex={sectionIndex}
                    formulaIndex={item.index}
                    kind={kind}
                    reportId={reportId}
                    onRemove={() => remove(item.index)}
                  />
                ))}
              </Table.Body>
            </Table>
          </div>
          {!rows.length && (
            <p className="p-4 text-sm text-muted-foreground">
              {t('noFormulas')}
            </p>
          )}
        </Tabs.Content>
      </Tabs>
    </div>
  );
};
