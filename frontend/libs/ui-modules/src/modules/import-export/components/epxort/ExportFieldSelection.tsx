import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconArrowLeft,
  IconCheck,
  IconMinus,
  IconTrash,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Calendar,
  Checkbox,
  Command,
  Combobox,
  Input,
  Select,
  Sheet,
} from 'erxes-ui';
import { useExportFieldSelection } from '../../hooks/export/useExportFieldSelection';
import {
  TExportFieldSelectionProps,
  TExportFilterRule,
  TExportHeader,
  TSearchAndActionsProps,
} from '../../types/export/exportTypes';
import { useEntityLabel } from '../../hooks/useEntityLabel';
import { getLocalDayExportBounds } from '../../utils/exportDateFilter';

type Step = 'columns' | 'filters';
type DraftRule = {
  field: string;
  operator: string;
  date?: Date;
  value?: string;
};

const TEXT_OPERATORS = [
  ['equals', 'equals to'],
  ['notEqual', 'is not equal to'],
  ['contains', 'contains'],
  ['notContain', 'does not contain'],
  ['isSet', 'is set'],
  ['notSet', 'is not set'],
] as const;

const DATE_OPERATORS = [
  ['greaterThan', 'date is greater than'],
  ['lessThan', 'date is less than'],
] as const;

const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getRuleSummary = (rule: DraftRule, header: TExportHeader) => {
  const field = (header.exportFilterLabel ?? header.label).toLocaleLowerCase();

  if (header.exportFilterType === 'date' && rule.date) {
    if (rule.operator === 'greaterThan') {
      const nextDay = new Date(
        rule.date.getFullYear(),
        rule.date.getMonth(),
        rule.date.getDate() + 1,
      );
      return `Matches records where ${field} is after ${formatDate(
        rule.date,
      )}. Results start ${formatDate(nextDay)}.`;
    }
    if (rule.operator === 'lessThan') {
      return `Matches records where ${field} is before ${formatDate(
        rule.date,
      )}. The selected day is excluded.`;
    }
  }

  if (header.exportFilterType === 'text') {
    if (rule.operator === 'isSet') {
      return `Matches records where ${field} has a value.`;
    }
    if (rule.operator === 'notSet') {
      return `Matches records where ${field} is empty.`;
    }
    if (rule.value) {
      const descriptions: Record<string, string> = {
        equals: 'equals',
        notEqual: 'has a value and does not equal',
        contains: 'contains',
        notContain: 'has a value and does not contain',
      };
      return `Matches records where ${field} ${descriptions[rule.operator]} “${
        rule.value
      }”.`;
    }
  }

  return '';
};

const toExportRule = (
  draft: DraftRule,
  header: TExportHeader,
): TExportFilterRule => {
  if (header.exportFilterType === 'date' && draft.date) {
    if (draft.operator !== 'greaterThan' && draft.operator !== 'lessThan') {
      throw new Error('Unsupported date export filter');
    }
    return {
      field: draft.field,
      operator: draft.operator,
      ...getLocalDayExportBounds(draft.date, draft.operator),
    };
  }
  return {
    field: draft.field,
    operator: draft.operator,
    value: draft.value,
  };
};

export function SearchAndActions({
  onSelectAll,
  onDeselectAll,
  onSelectDefaults,
  selectedCount,
  totalCount,
}: TSearchAndActionsProps) {
  const { t } = useTranslation('importExport');
  return (
    <div className="flex items-center gap-1 border-b p-2">
      <Button variant="ghost" size="sm" onClick={onSelectDefaults}>
        {t('suggested')}
      </Button>
      <Button variant="ghost" size="sm" onClick={onSelectAll}>
        <IconCheck /> {t('select-all')}
      </Button>
      <Button variant="ghost" size="sm" onClick={onDeselectAll}>
        <IconMinus /> {t('clear')}
      </Button>
      <span className="ml-auto px-2 text-xs text-muted-foreground">
        {t('fields-selected', { selected: selectedCount, total: totalCount })}
      </span>
    </div>
  );
}

export function ExportFieldSelection({
  entityType,
  open,
  onOpenChange,
  onConfirm,
  recordCount,
  entityDisplayName,
  filters,
}: TExportFieldSelectionProps) {
  const { t } = useTranslation('importExport');
  const [step, setStep] = useState<Step>('columns');
  const [rules, setRules] = useState<DraftRule[]>([]);
  const [fieldToAdd, setFieldToAdd] = useState('');
  const {
    selectedFields,
    headers,
    loading,
    handleDeselectAll,
    handleSelectAll,
    handleSelectDefaults,
    handleToggleField,
  } = useExportFieldSelection({
    entityType,
    filters,
    open,
  });

  useEffect(() => {
    if (!open) {
      setStep('columns');
      setRules([]);
      setFieldToAdd('');
    }
  }, [open]);

  const derivedEntityLabel = useEntityLabel(
    entityType.split('.').pop() || 'record',
    { plural: true, capitalize: true },
  );
  const entityName = entityDisplayName || derivedEntityLabel;
  const systemHeaders = headers.filter(
    (header) => header.type !== 'customProperty',
  );
  const customHeaders = headers.filter(
    (header) => header.type === 'customProperty',
  );
  const filterHeaders = headers.filter((header) => header.exportFilterType);
  const availableHeaders = filterHeaders.filter(
    (header) => !rules.some((rule) => rule.field === header.key),
  );
  const complete = rules.every((rule) => {
    const header = filterHeaders.find((item) => item.key === rule.field);
    if (!header || !rule.operator) return false;
    return header.exportFilterType === 'date'
      ? Boolean(rule.date)
      : ['isSet', 'notSet'].includes(rule.operator) ||
          Boolean(rule.value?.trim());
  });

  const updateRule = (field: string, patch: Partial<DraftRule>) =>
    setRules((current) =>
      current.map((rule) =>
        rule.field === field ? { ...rule, ...patch } : rule,
      ),
    );

  const finish = () => {
    const exportRules = rules.map((rule) => {
      const header = filterHeaders.find((item) => item.key === rule.field);
      if (!header) throw new Error('Missing export filter header');
      return toExportRule(rule, header);
    });
    onConfirm(selectedFields, exportRules);
    onOpenChange(false);
  };

  const renderItem = (header: TExportHeader) => (
    <Command.Item
      key={header.key}
      value={`${header.label} ${header.key}`.trim()}
      className="cursor-pointer"
      onSelect={() => handleToggleField(header.key)}
    >
      <Checkbox
        checked={selectedFields.includes(header.key)}
        className="pointer-events-none"
        aria-label={header.label}
      />
      <span className="min-w-0 flex-1 truncate">{header.label}</span>
      {header.isDefault && <Badge variant="secondary">{t('suggested')}</Badge>}
    </Command.Item>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View>
        <Sheet.Header>
          <Sheet.Title className="flex items-center gap-2">
            {step === 'filters' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep('columns')}
                aria-label={t('back', 'Back')}
              >
                <IconArrowLeft />
              </Button>
            )}
            {t('export-entity', { entity: entityName })}
            <Badge variant="secondary">CSV</Badge>
          </Sheet.Title>
          <Sheet.Description className="sr-only">
            {t('export-fields-description')}
            {recordCount !== undefined &&
              ` ${t('export-selected-records-note', { total: recordCount })}`}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex min-h-0 flex-col overflow-y-auto">
          {step === 'columns' ? (
            <Command className="flex min-h-0 flex-1 flex-col">
              <Command.Input
                variant="primary"
                placeholder={t('search-fields-by-name')}
              />
              <SearchAndActions
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onSelectDefaults={handleSelectDefaults}
                selectedCount={selectedFields.length}
                totalCount={headers.length}
              />
              <Command.List className="max-h-none min-h-0 flex-1 overflow-y-auto p-1">
                <Combobox.Empty loading={loading} />
                <Command.Group heading={t('system-fields')}>
                  {systemHeaders.map(renderItem)}
                </Command.Group>
                {customHeaders.length > 0 && (
                  <Command.Group heading={t('custom-properties')}>
                    {customHeaders.map(renderItem)}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          ) : (
            <div className="space-y-4 p-4">
              <div>
                <h3 className="font-medium">
                  {t('filter-rules', 'Filter rules')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'export-filter-description',
                    'Only records matching every rule below will be exported. Current page filters also stay active.',
                  )}
                </p>
              </div>
              {availableHeaders.length > 0 && (
                <Select
                  value={fieldToAdd}
                  onValueChange={(field) => {
                    setFieldToAdd(field);
                    setRules((current) => [
                      ...current,
                      { field, operator: '' },
                    ]);
                    setFieldToAdd('');
                  }}
                >
                  <Select.Trigger>
                    <Select.Value placeholder={t('add-filter', 'Add filter')} />
                  </Select.Trigger>
                  <Select.Content>
                    {availableHeaders.map((header) => (
                      <Select.Item key={header.key} value={header.key}>
                        {header.exportFilterLabel ?? header.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
              {rules.length === 0 && (
                <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  {t('no-export-filters', 'No export filters added.')}
                </p>
              )}
              {rules.map((rule) => {
                const header = filterHeaders.find(
                  (item) => item.key === rule.field,
                );
                if (!header) return null;
                const operators: ReadonlyArray<readonly [string, string]> =
                  header.exportFilterType === 'date'
                    ? DATE_OPERATORS
                    : TEXT_OPERATORS;
                const summary = getRuleSummary(rule, header);
                return (
                  <div
                    key={rule.field}
                    className="space-y-3 rounded-md border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {header.exportFilterLabel ?? header.label}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setRules((current) =>
                            current.filter((item) => item.field !== rule.field),
                          )
                        }
                        aria-label={t('remove', 'Remove')}
                      >
                        <IconTrash />
                      </Button>
                    </div>
                    <Select
                      value={rule.operator}
                      onValueChange={(operator) =>
                        updateRule(rule.field, {
                          operator,
                          date: undefined,
                          value: undefined,
                        })
                      }
                    >
                      <Select.Trigger>
                        <Select.Value
                          placeholder={t(
                            'select-condition',
                            'Select a condition',
                          )}
                        />
                      </Select.Trigger>
                      <Select.Content>
                        {operators.map(([value, label]) => (
                          <Select.Item key={value} value={value}>
                            {t(value, label)}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    {header.exportFilterType === 'date' && rule.operator && (
                      <div className="flex justify-center">
                        <Calendar
                          className="mx-auto"
                          mode="single"
                          selected={rule.date}
                          onSelect={(date) => updateRule(rule.field, { date })}
                        />
                      </div>
                    )}
                    {header.exportFilterType === 'text' &&
                      rule.operator &&
                      !['isSet', 'notSet'].includes(rule.operator) && (
                        <Input
                          value={rule.value ?? ''}
                          onChange={(event) =>
                            updateRule(rule.field, {
                              value: event.target.value,
                            })
                          }
                          placeholder={t('enter-value', 'Enter value')}
                        />
                      )}
                    {summary ? (
                      <div className="rounded-md bg-muted/60 px-3 py-2 text-sm leading-5">
                        <span className="font-medium">
                          {t('filter-to-apply', 'Filter to apply')}:{' '}
                        </span>
                        {summary}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {rule.operator
                          ? t(
                              'choose-filter-value',
                              'Choose a value to complete this filter.',
                            )
                          : t(
                              'choose-filter-condition',
                              'Choose a condition to complete this filter.',
                            )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Sheet.Content>
        <Sheet.Footer>
          <Button
            variant="outline"
            onClick={() =>
              step === 'filters' ? setStep('columns') : onOpenChange(false)
            }
          >
            {step === 'filters' ? t('back', 'Back') : t('cancel')}
          </Button>
          {step === 'columns' && !recordCount ? (
            <Button
              onClick={() => setStep('filters')}
              disabled={loading || selectedFields.length === 0}
            >
              {t('next', 'Next')}
            </Button>
          ) : (
            <Button
              onClick={finish}
              disabled={loading || selectedFields.length === 0 || !complete}
            >
              {t('create-csv-export', { total: selectedFields.length })}
            </Button>
          )}
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
}
