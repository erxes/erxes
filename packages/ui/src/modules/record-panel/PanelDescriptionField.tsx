import { IconAlignLeft } from '@tabler/icons-react';
import { Editor } from '../blocks/components/LazyEditor';
import { useSaveOnLeave } from './useSaveOnLeave';

/**
 * A rich-text description row in the side panel, across its width.
 * Like the other cells it saves when you leave it, never while typing.
 */
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

  // The text starts under the label, as the panel's other values do: no drag handle needs the
  // editor's side room here (`/` still adds blocks), and the hover box reaches into the gutter.
  return (
    <div className="flex flex-col gap-1.5 pt-2 pb-3">
      <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
        <IconAlignLeft className="size-3.5 shrink-0" aria-hidden="true" />
        {label}
      </span>
      <div ref={containerRef} className="-mx-2">
        <Editor
          initialContent={value}
          onChange={onChange}
          scope={scope}
          label={label}
          readonly={readonly}
          isHTML={isHTML}
          variant="ghost"
          sideMenu={false}
          className="h-auto min-h-20 pb-2 [&_.bn-editor]:px-2!"
        />
      </div>
    </div>
  );
};
