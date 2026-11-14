import { useBlockEditor } from '../hooks/useBlockEditor';
import { useEditorValue } from '../hooks/useEditorValue';
import { BlockEditor } from './BlockEditor';
import type { BlockEditorProps, IEditorProps } from '../types/TextEditor';
import { cn } from 'erxes-ui/lib/utils';
import { parseBlocks } from '../utils/parseBlocks';

export const Editor = ({
  onChange,
  initialContent,
  scope,
  className,
  isHTML = false,
  uploadFile,
  label,
  variant = 'outline',
  ...props
}: Omit<BlockEditorProps, 'editor' | 'onChange'> & IEditorProps) => {
  const editor = useBlockEditor({
    initialContent: parseBlocks(initialContent ?? '') || undefined,
    uploadFile,
    label,
  });

  const handleChange = useEditorValue({ editor, initialContent, isHTML, onChange });

  return (
    <BlockEditor
      variant={variant}
      className={cn('min-w-0 w-full overflow-x-hidden overflow-y-auto h-28 min-h-28', className)}
      {...props}
      editor={editor}
      onChange={handleChange}
    />
  );
};
