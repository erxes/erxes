import { Editor } from 'erxes-ui';
import { IconAlignLeft } from '@tabler/icons-react';
import { useSaveOnLeave } from './useSaveOnLeave';

// Rich-text description across the panel's width. Like the other cells it
// saves when you leave it, never while typing.
export const PanelDescriptionField = ({
  label,
  value,
  scope,
  readonly,
  isHTML,
  onSave,
}: {
  label: string;
  value: string;
  scope: string;
  readonly?: boolean;
  /** Stores HTML instead of the editor's blocks. */
  isHTML?: boolean;
  onSave: (value: string) => void;
}) => {
  const { containerRef, onChange } = useSaveOnLeave({ value, readonly, onSave });

  return (
    <div className="flex flex-col gap-1.5 pt-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
        <IconAlignLeft className="size-3.5 shrink-0" aria-hidden="true" />
        {label}
      </span>
      <div ref={containerRef}>
        <Editor
          initialContent={value}
          onChange={onChange}
          scope={scope}
          label={label}
          readonly={readonly}
          isHTML={isHTML}
          className="h-auto min-h-20 rounded-sm shadow-none hover:bg-accent focus-within:bg-background focus-within:shadow-focus"
        />
      </div>
    </div>
  );
};
