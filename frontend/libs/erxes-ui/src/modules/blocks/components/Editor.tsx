import { useRef, useState } from 'react';
import { useBlockEditor } from '../hooks/useBlockEditor';
import { BlockEditor } from './BlockEditor';
import { Block } from '@blocknote/core';
import { BlockEditorProps, IEditorProps } from '../types';
import { usePreviousHotkeyScope } from 'erxes-ui/modules/hotkey/hooks/usePreviousHotkeyScope';
import { Key } from 'erxes-ui/types/Key';
import { useScopedHotkeys } from 'erxes-ui/modules/hotkey/hooks/useScopedHotkeys';
import { cn } from 'erxes-ui/lib';

export const Editor = ({
  onChange,
  initialContent,
  scope,
  className,
  ...props
}: Omit<BlockEditorProps, 'editor' | 'onChange'> & IEditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  useScopedHotkeys(
    `${Key.Escape}`,
    () => {
      if (ref.current) {
        ref.current.focus();
        goBackToPreviousHotkeyScope();
      }
    },
    scope,
  );

  const [content, setContent] = useState<Block[]>(
    initialContent ? JSON.parse(initialContent) : undefined,
  );
  const editor = useBlockEditor({
    initialContent: content,
  });

  const handleChange = async () => {
    const content = await editor?.document;
    setContent(content as Block[]);
    onChange(JSON.stringify(content));
  };

  return (
    <>
      <BlockEditor
        onBlur={goBackToPreviousHotkeyScope}
        onFocus={() => setHotkeyScopeAndMemorizePreviousScope(scope)}
        variant="outline"
        className={cn('h-28 rounded-md min-h-28 overflow-y-auto', className)}
        {...props}
        editor={editor}
        onChange={handleChange}
      />
      <div ref={ref} tabIndex={-1} className="sr-only" />
    </>
  );
};
