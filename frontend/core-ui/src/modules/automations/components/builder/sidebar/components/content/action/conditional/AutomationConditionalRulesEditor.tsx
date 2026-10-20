import { IconPlus } from '@tabler/icons-react';
import { Button, cn, Label } from 'erxes-ui';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import {
  AutomationConditionalValueSlot,
  SegmentConjunctionRail,
  TAutomationConditional,
  TAutomationConditionalFieldRender,
  TAutomationConditionalRow,
} from 'ui-modules';
import {
  AutomationConditionHeader,
  AutomationConditionRow,
} from '@/automations/components/builder/sidebar/components/content/action/conditional/AutomationConditionRow';
import {
  AutomationRuleCard,
  AutomationSortableRules,
} from '@/automations/components/builder/sidebar/components/content/action/conditional/AutomationRuleCard';
import { useAutomationConditionalEditor } from '@/automations/components/builder/sidebar/hooks/useAutomationConditionalEditor';
import { useAutomationConditionalEditorRow } from '@/automations/components/builder/sidebar/hooks/useAutomationConditionalEditorRow';

type TValueProps = {
  form: UseFormReturn<FieldValues>;
  names: string[];
  render: TAutomationConditionalFieldRender;
};

/**
 * Rules checked top to bottom, each a segment-style condition box with the
 * value it sets underneath; Otherwise closes the list.
 */
export const AutomationConditionalRulesEditor = ({
  conditional,
  onChange,
  ...valueProps
}: TValueProps & {
  conditional: TAutomationConditional;
  onChange: (conditional: TAutomationConditional) => void;
}) => {
  const {
    rows,
    addRow,
    removeRow,
    reorderRows,
    updateRow,
    updateOtherwise,
    errors,
  } = useAutomationConditionalEditor({ conditional, onChange });

  return (
    <div className="flex flex-col gap-3">
      <AutomationSortableRules
        ids={rows.map((row) => row.id)}
        onReorder={reorderRows}
      >
        {rows.map((row, index) => (
          <AutomationConditionalRule
            key={row.id}
            row={row}
            index={index}
            onChange={(patch) => updateRow(row.id, patch)}
            onRemove={() => removeRow(row.id)}
            {...valueProps}
          />
        ))}
      </AutomationSortableRules>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={addRow}
      >
        <IconPlus />
        Add rule
      </Button>

      <div className="flex items-start gap-3 border-t pt-4">
        <Label className="w-[120px] shrink-0 pt-2 text-xs uppercase tracking-wide text-muted-foreground">
          Otherwise
        </Label>
        <div className="min-w-0 flex-1">
          <AutomationConditionalValueSlot
            parentForm={valueProps.form}
            names={valueProps.names}
            values={conditional.otherwise}
            onChange={updateOtherwise}
            render={valueProps.render}
          />
        </div>
      </div>

      {errors.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-sm text-destructive">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AutomationConditionalRule = ({
  row,
  index,
  onChange,
  onRemove,
  form,
  names,
  render,
}: TValueProps & {
  row: TAutomationConditionalRow;
  index: number;
  onChange: (patch: Partial<TAutomationConditionalRow>) => void;
  onRemove: () => void;
}) => {
  const {
    summary,
    conjunction,
    toggleConjunction,
    updateCondition,
    removeCondition,
    addCondition,
    setValues,
  } = useAutomationConditionalEditorRow({ row, onChange });
  const showRail = row.conditions.length > 1;

  return (
    <AutomationRuleCard
      id={row.id}
      title={`Rule ${index + 1}`}
      summary={summary}
      onRemove={onRemove}
    >
      <AutomationConditionHeader />
      <div className="rounded-md border bg-background p-2">
        <div className="flex items-stretch">
          {showRail && (
            <SegmentConjunctionRail
              conjunction={conjunction}
              onToggle={toggleConjunction}
            />
          )}
          <div
            className={cn('flex min-w-0 flex-1 flex-col', showRail && 'pl-2')}
          >
            {row.conditions.map((condition, conditionIndex) => (
              <AutomationConditionRow
                key={conditionIndex}
                condition={condition}
                onChange={(next) => updateCondition(conditionIndex, next)}
                onRemove={() => removeCondition(conditionIndex)}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 pt-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={addCondition}
          >
            <IconPlus />
            Add condition
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Label className="w-[120px] shrink-0 pt-2 text-xs uppercase tracking-wide text-muted-foreground">
          Then
        </Label>
        <div className="min-w-0 flex-1">
          <AutomationConditionalValueSlot
            parentForm={form}
            names={names}
            values={row.values}
            onChange={setValues}
            render={render}
          />
        </div>
      </div>
    </AutomationRuleCard>
  );
};
