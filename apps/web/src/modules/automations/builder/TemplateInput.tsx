import { cn } from 'erxes-ui';
import { InsertData } from './DataPicker';
import type { FieldInfo } from './useAutomationFields';
import { useTokenField } from './useTokenField';

/**
 * Text an action sends or saves, with the run's data dropped in as chips: "Insert data" lists
 * the record's fields, the trigger's values, earlier steps' results and the time, and puts the
 * chip where the caret is. The value is still the template text (`Hi {{subject.firstName}}`).
 */
export const TemplateInput = ({
  value,
  onChange,
  fields,
  subject,
  multiline,
  label,
  placeholder,
  disabled,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fields: FieldInfo[];
  subject: 'customer' | 'company';
  multiline?: boolean;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
}) => {
  const { ref, insert } = useTokenField({ value, fields, multiline, onChange });

  return (
    <div
      className={cn(
        'relative flex w-full items-start gap-1 rounded-sm bg-background py-1 pr-1 pl-3 shadow-xs transition focus-within:shadow-focus',
        invalid && 'shadow-destructive',
        disabled && 'opacity-50',
      )}
    >
      {!value && placeholder && (
        <span className="pointer-events-none absolute top-1.5 left-3 text-sm text-accent-foreground">
          {placeholder}
        </span>
      )}
      <div
        ref={ref}
        aria-label={label}
        aria-multiline={multiline}
        aria-invalid={invalid ? true : undefined}
        aria-disabled={disabled ? true : undefined}
        contentEditable={!disabled}
        className={cn(
          'min-w-0 flex-1 py-0.5 text-sm leading-5 break-words whitespace-pre-wrap outline-hidden',
          multiline ? 'min-h-20' : 'min-h-5',
        )}
      />
      {!disabled && <InsertData fields={fields} subject={subject} onPick={insert} />}
    </div>
  );
};
