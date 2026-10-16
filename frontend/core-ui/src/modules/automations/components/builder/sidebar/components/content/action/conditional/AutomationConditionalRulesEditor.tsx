import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { Button, cn, Collapsible, Label } from 'erxes-ui';
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
    moveRow,
    updateRow,
    updateOtherwise,
    errors,
  } = useAutomationConditionalEditor({ conditional, onChange });

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <AutomationConditionalRule
          key={row.id}
          row={row}
          index={index}
          isFirst={index === 0}
          isLast={index === rows.length - 1}
          onChange={(patch) => updateRow(row.id, patch)}
          onMove={(direction) => moveRow(row.id, direction)}
          onRemove={() => removeRow(row.id)}
          {...valueProps}
        />
      ))}

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
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
  form,
  names,
  render,
}: TValueProps & {
  row: TAutomationConditionalRow;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<TAutomationConditionalRow>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) => {
  const {
    open,
    setOpen,
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
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-lg border bg-muted/30"
    >
      <div className="flex items-center gap-1 px-3 py-2">
        <Collapsible.Trigger asChild>
          <Button type="button" variant="ghost" size="icon">
            {open ? <IconChevronDown /> : <IconChevronRight />}
          </Button>
        </Collapsible.Trigger>
        <span className="shrink-0 text-sm font-medium">Rule {index + 1}</span>
        <span className="min-w-0 flex-1 truncate px-2 font-mono text-xs text-muted-foreground">
          {!open && summary}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Move up"
          disabled={isFirst}
          onClick={() => onMove(-1)}
        >
          <IconArrowUp />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Move down"
          disabled={isLast}
          onClick={() => onMove(1)}
        >
          <IconArrowDown />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Remove rule"
          className="text-destructive"
          onClick={onRemove}
        >
          <IconTrash />
        </Button>
      </div>

      <Collapsible.Content className="flex flex-col gap-2 border-t px-3 pb-3 pt-3">
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
      </Collapsible.Content>
    </Collapsible>
  );
};
