import { SectionName } from '@/tunable-reports/SectionName';
import { useEffect, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { Button, Sheet, useConfirm, Form } from 'erxes-ui';
import { IconSettings, IconTrash, IconPlus } from '@tabler/icons-react';
import {
  ReportForm,
  TextSetting,
  TextareaSetting,
  ChoiceSetting,
  CheckSetting,
  PeriodSettings,
  Choice,
} from '@/tunable-reports/fields';
import { FormulaCellEditor } from '@/tunable-reports/FormulaEditor';
import { ReportGrid, GridTarget } from '@/tunable-reports/ReportGrid';
import { newColumn, newRow } from '@/tunable-reports/values';
import { reportSectionInputSchema } from '@/tunable-reports/schema';
import { useReportTranslation } from '@/tunable-reports/locales';
import { notifyMutationResult } from '@/utils/graphqlMutation';

type SettingsTarget =
  | { kind: 'section' }
  | { kind: 'row' | 'column'; id: string }
  | { kind: 'cell'; target: GridTarget };
export const SectionEditor = ({
  form,
  index,
  reportId,
  onRemove,
  revealErrors = false,
}: {
  form: ReportForm;
  index: number;
  reportId?: string;
  onRemove?: () => Promise<void>;
  revealErrors?: boolean;
}) => {
  const { t } = useReportTranslation();
  const { confirm } = useConfirm();
  const path = `sections.${index}` as const;
  const section = useWatch({ control: form.control, name: path });
  const columns = useFieldArray({
    control: form.control,
    name: `${path}.columns`,
  });
  const rows = useFieldArray({ control: form.control, name: `${path}.rows` });
  const [settings, setSettings] = useState<SettingsTarget>();
  const [pendingRemoval, setPendingRemoval] = useState<{
    kind: 'rows' | 'columns';
    id: string;
  }>();
  const removeRow = rows.remove;
  const removeColumn = columns.remove;
  useEffect(() => {
    if (!pendingRemoval || settings) return;
    // Unmount the sheet Controllers before removing their indexed fields.
    const current = form.getValues(path);
    const { kind, id } = pendingRemoval;
    const itemIndex = current[kind].findIndex((item) => item._id === id);
    if (itemIndex >= 0) {
      const lastColumn = kind === 'columns' && current.columns.length === 1;
      form.setValue(
        `${path}.formulas`,
        lastColumn
          ? []
          : current.formulas.filter((formula) =>
              kind === 'rows' ? formula.rowId !== id : formula.columnId !== id,
            ),
        { shouldDirty: true },
      );
      if (kind === 'rows') removeRow(itemIndex);
      else removeColumn(itemIndex);
    }
    setPendingRemoval(undefined);
  }, [pendingRemoval, settings, form, path, removeRow, removeColumn]);

  const rowIndex =
    settings?.kind === 'row'
      ? section.rows.findIndex((row) => row._id === settings.id)
      : -1;
  const columnIndex =
    settings?.kind === 'column'
      ? section.columns.findIndex((column) => column._id === settings.id)
      : -1;
  const formulaErrors = form.formState.errors.sections?.[index]?.formulas;
  const columnErrors = form.formState.errors.sections?.[index]?.columns;
  useEffect(() => {
    if (!revealErrors) return;
    const formula = section.formulas.find(
      (_formula, formulaIndex) => formulaErrors?.[formulaIndex],
    );
    if (formula)
      setSettings({
        kind: 'cell',
        target: {
          rowId: formula.rowId,
          columnId: formula.columnId || section.columns[0]?._id || '',
        },
      });
    else {
      const column = section.columns.find(
        (_column, columnIndex) => columnErrors?.[columnIndex],
      );
      if (column) setSettings({ kind: 'column', id: column._id });
    }
  }, [
    formulaErrors,
    columnErrors,
    section.formulas,
    section.columns,
    revealErrors,
  ]);
  const deleteItem = async (kind: 'rows' | 'columns', itemIndex: number) => {
    const item = section[kind][itemIndex];
    const lastColumn = kind === 'columns' && section.columns.length === 1;
    const referenced = form.getValues('sections').some((otherSection) =>
      otherSection.formulas.some((formula) => {
        if (lastColumn && otherSection._id === section._id) return false;
        if (
          kind === 'rows' &&
          otherSection._id === section._id &&
          formula.rowId === item._id
        )
          return false;
        return [formula.source, formula.ratioSource].some(
          (source) =>
            source &&
            (!source.reportId || source.reportId === reportId) &&
            (source.sectionId || otherSection._id) === section._id &&
            (kind === 'rows'
              ? source.rowId === item._id
              : source.columnId === item._id),
        );
      }),
    );
    if (referenced) {
      notifyMutationResult(false, t('referenced'));
      return;
    }
    try {
      await confirm({
        message: t(
          kind === 'rows'
            ? 'removeRowConfirm'
            : lastColumn
            ? 'removeLastColumnConfirm'
            : 'removeColumnConfirm',
        ),
      });
    } catch {
      return;
    }
    setPendingRemoval({ kind, id: item._id });
    setSettings(undefined);
  };
  const addColumn = () => columns.append(newColumn());
  const addRow = () =>
    rows.append(reportSectionInputSchema.shape.rows.element.parse(newRow()));
  const title =
    settings?.kind === 'row'
      ? t('rowSettings')
      : settings?.kind === 'column'
      ? t('columnSettings')
      : settings?.kind === 'cell'
      ? t('configureFormula')
      : t('sectionSettings');
  const cellRow =
    settings?.kind === 'cell'
      ? section.rows.find((row) => row._id === settings.target.rowId)
      : undefined;
  const cellColumn =
    settings?.kind === 'cell'
      ? section.columns.find(
          (column) => column._id === settings.target.columnId,
        )
      : undefined;
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center gap-2 border-b py-2 pl-10 pr-2">
        <div className="min-w-0 flex-1">
          <SectionName form={form} index={index} />
        </div>
        {!section.isActive && (
          <span className="text-xs text-muted-foreground">{t('archived')}</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`${t('sectionSettings')} · ${section.name}`}
          onClick={() => setSettings({ kind: 'section' })}
        >
          <IconSettings className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-8 whitespace-nowrap px-2 font-normal text-muted-foreground"
          onClick={addColumn}
        >
          <IconPlus className="size-4" />
          {t('addColumn')}
        </Button>
      </div>
      <ReportGrid
        form={form}
        index={index}
        rowFields={rows.fields}
        columnFields={columns.fields}
        moveRow={rows.move}
        moveColumn={columns.move}
        addRow={addRow}
        editRow={(id) => setSettings({ kind: 'row', id })}
        editColumn={(id) => setSettings({ kind: 'column', id })}
        editCell={(target) => setSettings({ kind: 'cell', target })}
      />
      <Sheet
        open={!!settings}
        onOpenChange={(open) => !open && setSettings(undefined)}
      >
        <Sheet.View
          className={
            settings?.kind === 'cell'
              ? 'sm:max-w-3xl bg-background'
              : 'sm:max-w-lg bg-background'
          }
        >
          <Sheet.Header
            className={settings?.kind === 'cell' ? 'h-auto py-2' : undefined}
          >
            <div className="min-w-0">
              <Sheet.Title>{title}</Sheet.Title>
              {cellRow && (
                <p className="truncate text-xs text-muted-foreground">
                  {cellRow.name || cellRow.number} ·{' '}
                  {section.formulaType === 'row'
                    ? t('rowScope')
                    : cellColumn?.name}
                </p>
              )}
            </div>
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Content className="overflow-y-auto">
            {settings?.kind === 'section' && (
              <div className="space-y-4 p-4">
                <TextSetting
                  form={form}
                  name={`${path}.name`}
                  label={t('name')}
                />
                <FormScope form={form} index={index} />
                <CheckSetting
                  form={form}
                  name={`${path}.isActive`}
                  label={t('enabled')}
                />
                <TextareaSetting
                  form={form}
                  name={`${path}.header`}
                  label={t('header')}
                />
                <TextareaSetting
                  form={form}
                  name={`${path}.footer`}
                  label={t('footer')}
                />
              </div>
            )}
            {rowIndex >= 0 && (
              <div className="space-y-4 p-4">
                <TextSetting
                  form={form}
                  name={`${path}.rows.${rowIndex}.number`}
                  label={t('number')}
                />
                <TextSetting
                  form={form}
                  name={`${path}.rows.${rowIndex}.name`}
                  label={t('name')}
                />
                <ChoiceSetting
                  form={form}
                  name={`${path}.rows.${rowIndex}.kind`}
                  label={t('kind')}
                  options={[
                    { value: 'formula', label: t('formulaRow') },
                    { value: 'plus_formula', label: t('positiveRow') },
                    { value: 'title', label: t('titleRow') },
                    { value: 'date', label: t('dateRow') },
                  ]}
                />
                <PeriodSettings form={form} path={`${path}.rows.${rowIndex}`} />
                <ChoiceSetting
                  form={form}
                  name={`${path}.rows.${rowIndex}.valueSide`}
                  label={t('valueSide')}
                  options={['call_value', 'debit', 'credit'].map((value) => ({
                    value,
                    label: t(value),
                  }))}
                />
                <TextSetting
                  form={form}
                  name={`${path}.rows.${rowIndex}.tabCount`}
                  label={t('indent')}
                  type="number"
                />
                <div className="flex gap-4">
                  {(['isBold', 'isItalic', 'isUnderline'] as const).map(
                    (field) => (
                      <CheckSetting
                        key={field}
                        form={form}
                        name={`${path}.rows.${rowIndex}.${field}`}
                        label={t(
                          {
                            isBold: 'bold',
                            isItalic: 'italic',
                            isUnderline: 'underline',
                          }[field],
                        )}
                      />
                    ),
                  )}
                </div>
                <CheckSetting
                  form={form}
                  name={`${path}.rows.${rowIndex}.isActive`}
                  label={t('enabled')}
                />
              </div>
            )}
            {columnIndex >= 0 && (
              <div className="space-y-4 p-4">
                <TextSetting
                  form={form}
                  name={`${path}.columns.${columnIndex}.name`}
                  label={t('name')}
                />
                <PeriodSettings
                  form={form}
                  path={`${path}.columns.${columnIndex}`}
                />
                <CheckSetting
                  form={form}
                  name={`${path}.columns.${columnIndex}.isActive`}
                  label={t('enabled')}
                />
              </div>
            )}
            {settings?.kind === 'cell' && (
              <FormulaCellEditor
                key={`${settings.target.rowId}-${settings.target.columnId}`}
                form={form}
                sectionIndex={index}
                reportId={reportId}
                target={settings.target}
              />
            )}
          </Sheet.Content>
          <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
            {settings?.kind === 'section' && onRemove && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => void onRemove()}
              >
                <IconTrash />
                {t('remove')}
              </Button>
            )}
            {rowIndex >= 0 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => void deleteItem('rows', rowIndex)}
              >
                <IconTrash />
                {t('remove')}
              </Button>
            )}
            {columnIndex >= 0 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => void deleteItem('columns', columnIndex)}
              >
                <IconTrash />
                {t('remove')}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setSettings(undefined)}
            >
              {t('done')}
            </Button>
          </Sheet.Footer>
        </Sheet.View>
      </Sheet>
    </section>
  );
};

const FormScope = ({ form, index }: { form: ReportForm; index: number }) => {
  const { t } = useReportTranslation();
  return (
    <Form.Field
      control={form.control}
      name={`sections.${index}.formulaType`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('formulaType')}</Form.Label>
          <Choice
            label={t('formulaType')}
            value={field.value}
            options={[
              { value: 'row', label: t('rowScope') },
              { value: 'cell', label: t('cellScope') },
            ]}
            onChange={(value) => {
              if (
                value !== field.value &&
                form.getValues(`sections.${index}.formulas`).length
              ) {
                notifyMutationResult(false, t('changeScope'));
                return;
              }
              field.onChange(value);
            }}
          />
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
