import { useDescriptionEditor } from '@/operation/hooks/useDescriptionEditor';
import { IconAlignLeft } from '@tabler/icons-react';
import { BlockEditor, Spinner } from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const RecordDescriptionField = ({
  value,
  onSave,
}: {
  value?: string | null;
  onSave: (description: string) => void;
}) => {
  const { t } = useTranslation('operation');
  const { editor, isReady } = useDescriptionEditor(
    value,
    t('description-command-placeholder', 'Type "/" for commands...'),
  );
  const beforeEditing = useRef<string>();

  return (
    <div className="min-w-0 pt-2 @3xl/record-panel:border-l @3xl/record-panel:pl-6">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
        <IconAlignLeft className="size-3.5 shrink-0" aria-hidden="true" />
        {t('description', 'Description')}
      </div>
      {isReady ? (
        <BlockEditor
          editor={editor}
          className="min-h-32 rounded-sm read-only [&_.bn-editor]:px-2"
          onFocus={() => {
            beforeEditing.current = JSON.stringify(editor.document);
          }}
          onBlur={() => {
            const description = JSON.stringify(editor.document);
            if (
              beforeEditing.current !== undefined &&
              description !== beforeEditing.current
            ) {
              beforeEditing.current = description;
              onSave(description);
            }
          }}
        />
      ) : (
        <Spinner containerClassName="py-6" />
      )}
    </div>
  );
};
