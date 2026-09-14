import { BlockEditor, useBlockEditor } from 'erxes-ui';
import { useEffect, useRef } from 'react';
import { SpecificFieldProps } from './Field';

type EditorBlock = {
  type: string;
  content?: unknown[];
  children?: unknown[];
};

// A "blank" editor still serializes to one empty default paragraph block,
// so a non-empty JSON string alone doesn't mean the user actually typed anything.
const hasContent = (value: unknown): boolean => {
  if (typeof value !== 'string' || !value) {
    return false;
  }

  try {
    const blocks = JSON.parse(value) as EditorBlock[];

    if (!Array.isArray(blocks) || blocks.length === 0) {
      return false;
    }

    if (blocks.length > 1) {
      return true;
    }

    const [block] = blocks;

    return (
      block.type !== 'paragraph' ||
      Boolean(block.content?.length) ||
      Boolean(block.children?.length)
    );
  } catch {
    return false;
  }
};

export const FieldEditor = (props: SpecificFieldProps) => {
  const { value, handleChange, inCell } = props;
  const editor = useBlockEditor();
  // Intentionally NOT seeded from `value`: the editor always mounts empty
  // (useBlockEditor() has no initialContent), so the first effect run below
  // must always be allowed to load the saved value into it.
  const lastLoaded = useRef<string>('');

  useEffect(() => {
    const json = typeof value === 'string' ? value : '';

    if (json === lastLoaded.current) {
      return;
    }

    lastLoaded.current = json;

    try {
      const blocks = json ? JSON.parse(json) : [];
      editor.replaceBlocks(editor.document, blocks);
    } catch {
      // ignore unparsable content
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = () => {
    const json = JSON.stringify(editor.document);

    if (json !== lastLoaded.current) {
      lastLoaded.current = json;
      handleChange(json);
    }
  };

  if (inCell) {
    return (
      <span className="px-2 text-muted-foreground text-xs truncate">
        {hasContent(value) ? 'Edited' : '—'}
      </span>
    );
  }

  return (
    <BlockEditor
      editor={editor}
      variant="outline"
      className="min-h-24 rounded-md p-2"
      onBlur={commit}
    />
  );
};
