import { cn } from 'erxes-ui';
import { type DragEvent, useContext, useRef, useState } from 'react';
import { DATA_PATH_TYPE, DataTargetContext, rangeAt } from './dataTarget';
import { InsertData } from './DataPicker';
import { readableTemplate, templateParts } from './templateText';
import type { FieldInfo } from './useAutomationFields';
import { CHIP, chipLabel, useTokenField } from './useTokenField';

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fields: FieldInfo[];
  subject: 'customer' | 'company';
  multiline?: boolean;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
};

const Example = ({
  text,
  fields,
  className,
}: {
  text: string;
  fields: FieldInfo[];
  className: string;
}) => (
  <span
    aria-hidden
    className={cn(
      'pointer-events-none absolute inset-0 text-sm leading-5 break-words whitespace-pre-wrap text-accent-foreground',
      className,
    )}
  >
    {templateParts(text).map((part) =>
      'text' in part ? (
        <span key={part.at}>{part.text}</span>
      ) : (
        <span key={part.at} className={cn(CHIP, 'opacity-60')}>
          {chipLabel(part.path, part.filters, fields)}
        </span>
      ),
    )}
  </span>
);

/** Typing `{` opens the data picker at the caret; closing it without a pick types the `{`. */
const usePickedData = ({
  value,
  fields,
  multiline,
  onChange,
}: Pick<FieldProps, 'value' | 'fields' | 'multiline' | 'onChange'>) => {
  const [open, setOpen] = useState(false);
  const fromBrace = useRef(false);

  const { ref, insert, type } = useTokenField({
    value,
    fields,
    multiline,
    onChange,
    onBrace: () => {
      fromBrace.current = true;
      setOpen(true);
    },
  });

  const onPick = (path: string) => {
    fromBrace.current = false;
    insert(path);
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);

    if (next || !fromBrace.current) return;

    fromBrace.current = false;
    type('{');
  };

  return { ref, insert, picking: { open, onPick, onOpenChange } };
};

const carriesPath = (event: DragEvent) => event.dataTransfer.types.includes(DATA_PATH_TYPE);

const useDataDrop = (insert: (path: string, at?: Range | null) => void, disabled?: boolean) => {
  const targets = useContext(DataTargetContext);
  const [dropping, setDropping] = useState(false);
  const own = () => targets.own(insert);

  const onDragOver = (event: DragEvent) => {
    if (disabled || !carriesPath(event)) return;

    event.preventDefault();
    setDropping(true);
  };

  const onDrop = (event: DragEvent) => {
    setDropping(false);

    const path = event.dataTransfer.getData(DATA_PATH_TYPE);

    if (disabled || !path) return;

    event.preventDefault();
    own();
    insert(path, rangeAt(event.clientX, event.clientY));
  };

  return {
    dropping,
    handlers: { onFocus: own, onDragOver, onDragLeave: () => setDropping(false), onDrop },
  };
};

/**
 * Text an action sends or saves, with the run's data dropped in as chips: "Insert data", or
 * typing `{`, lists the record's fields, the trigger's values, earlier steps' results and the
 * time, and puts the chip where the caret is. The value is still the template text
 * (`Hi {{subject.firstName}}`).
 */
export const TemplateInput = (props: FieldProps) => {
  const { label, fields, subject, multiline, placeholder, disabled, invalid } = props;
  const { ref, insert, picking } = usePickedData(props);
  const { dropping, handlers } = useDataDrop(insert, disabled);
  const box = multiline ? 'px-3 pt-1.5 pb-0.5' : 'py-0.5';

  const picker = <InsertData fields={fields} subject={subject} {...picking} />;

  return (
    <div
      {...handlers}
      className={cn(
        'flex w-full rounded-sm bg-background shadow-xs transition focus-within:shadow-focus',
        multiline ? 'flex-col' : 'items-start gap-1 py-1 pr-1 pl-3',
        invalid && 'shadow-destructive',
        dropping && 'shadow-focus',
        disabled && 'opacity-50',
      )}
    >
      <div className="relative min-w-0 flex-1">
        {!props.value && placeholder && (
          <Example text={placeholder} fields={fields} className={box} />
        )}
        <div
          ref={ref}
          aria-label={label}
          aria-placeholder={placeholder ? readableTemplate(placeholder, fields) : undefined}
          aria-multiline={multiline}
          aria-invalid={invalid ? true : undefined}
          aria-disabled={disabled ? true : undefined}
          contentEditable={!disabled}
          className={cn(
            'text-sm leading-5 break-words whitespace-pre-wrap outline-hidden',
            box,
            multiline ? 'min-h-20' : 'min-h-5',
          )}
        />
      </div>
      {!disabled &&
        (multiline ? <div className="flex justify-end px-1 pb-1">{picker}</div> : picker)}
    </div>
  );
};
