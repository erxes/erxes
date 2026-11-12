import { Editor } from 'erxes-ui';
import { useRef } from 'react';
import { IconAlignLeft } from '@tabler/icons-react';

// The editor reports its content this long after the last keystroke.
const EDITOR_SETTLE_MS = 350;

// Rich-text description across the panel's width. Like the other cells it
// saves when you leave it, never while typing.
export const PanelDescriptionField = ({
  label,
  value,
  scope,
  onSave,
}: {
  label: React.ReactNode;
  value: string;
  scope: string;
  onSave: (value: string) => void;
}) => {
  const latest = useRef(value);
  const saved = useRef(value);

  /** Saves a changed description when its editor loses focus. */
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setTimeout(() => {
      if (latest.current !== saved.current) {
        saved.current = latest.current;
        onSave(latest.current);
      }
    }, EDITOR_SETTLE_MS);
  };

  return (
    <div className="flex flex-col gap-1.5 pt-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
        <IconAlignLeft className="size-3.5 shrink-0" aria-hidden="true" />
        {label}
      </span>
      <div onBlur={handleBlur}>
        <Editor
          initialContent={value}
          onChange={(next) => {
            latest.current = next;
          }}
          scope={scope}
          className="h-auto min-h-20 rounded-sm shadow-none hover:bg-accent focus-within:bg-background focus-within:shadow-focus"
        />
      </div>
    </div>
  );
};
