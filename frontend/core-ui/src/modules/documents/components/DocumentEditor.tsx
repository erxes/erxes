import { DocumentAttributesSidebar } from '@/documents/components/DocumentAttributesSidebar';
import { DocumentEditorSkeleton } from '@/documents/components/DocumentEditorSkeleton';
import { useDocument } from '@/documents/hooks/useDocument';
import { useDocumentAttributes } from '@/documents/hooks/useDocumentAttributes';
import {
  ATTRIBUTE_DND_MIME,
  insertAttributeAtPoint,
} from '@/documents/utils/attributeDnd';
import { IconFileText, IconLayoutSidebarRightExpand } from '@tabler/icons-react';
import { Button, BlockEditor, cn, IBlockEditor, useBlockEditor } from 'erxes-ui';

import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { AttributeInEditor } from 'ui-modules';

const EditorController = ({
  editor,
  onChange,
  attributes,
  loading,
}: {
  editor: IBlockEditor;
  onChange: (value: string) => void;
  attributes: any[];
  loading: boolean;
}) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);

  useEffect(() => {
    const unsubscribe = editor.onChange((editor: IBlockEditor) => {
      onChange(JSON.stringify(editor.document));
    });

    return unsubscribe;
  }, [editor, onChange]);

  useEffect(() => {
    const node = dropRef.current;

    if (!node) return;

    const isAttributeDrag = (e: DragEvent) =>
      !!e.dataTransfer?.types.includes(ATTRIBUTE_DND_MIME);

    const handleDragOver = (e: DragEvent) => {
      if (!isAttributeDrag(e)) return;

      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      setIsDropTarget(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      if (node.contains(e.relatedTarget as Node)) return;
      setIsDropTarget(false);
    };

    const handleDrop = (e: DragEvent) => {
      if (!isAttributeDrag(e)) return;

      e.preventDefault();
      e.stopImmediatePropagation();
      setIsDropTarget(false);

      const raw = e.dataTransfer?.getData(ATTRIBUTE_DND_MIME);

      if (!raw) return;

      try {
        const attribute = JSON.parse(raw);
        insertAttributeAtPoint(editor, attribute, e.clientX, e.clientY);
      } catch {
        return;
      }
    };

    node.addEventListener('dragover', handleDragOver, true);
    node.addEventListener('dragleave', handleDragLeave, true);
    node.addEventListener('drop', handleDrop, true);

    return () => {
      node.removeEventListener('dragover', handleDragOver, true);
      node.removeEventListener('dragleave', handleDragLeave, true);
      node.removeEventListener('drop', handleDrop, true);
    };
  }, [editor]);

  return (
    <div
      ref={dropRef}
      className={cn(
        'flex min-h-0 flex-1 flex-col transition-colors',
        isDropTarget && 'bg-primary/5 ring-2 ring-inset ring-primary/40',
      )}
    >
      <BlockEditor
        editor={editor}
        className={cn('w-full flex-1 overflow-y-auto overflow-x-hidden px-5 pb-16')}
      >
        <AttributeInEditor
          editor={editor}
          attributes={attributes}
          loading={loading}
        />
      </BlockEditor>
    </div>
  );
};

const DocumentContentEditor = ({
  editor,
  document,
  attributes,
  attributesLoading,
}: any) => {
  const { control } = useFormContext();

  useEffect(() => {
    if (!document?.content || !editor) return;

    const loadInitialContent = async () => {
      let blocks;

      try {
        blocks = JSON.parse(document.content);
      } catch (_error) {
        try {
          blocks = await editor.tryParseHTMLToBlocks(document.content);
        } catch (_htmlError) {
          blocks = await editor.tryParseMarkdownToBlocks(document.content);
        }
      }

      editor.replaceBlocks(editor.document, blocks);
    };

    loadInitialContent();
  }, [document?.content, editor]);

  return (
    <Controller
      name="content"
      control={control}
      rules={{ required: 'Content is required' }}
      render={({ field }) => (
        <EditorController
          editor={editor}
          onChange={field.onChange}
          attributes={attributes}
          loading={attributesLoading}
        />
      )}
    />
  );
};

const DocumentTitleEditor = ({
  value,
  onChange,
  onEnterPress,
}: {
  value: string;
  onChange: (value: string) => void;
  onEnterPress: () => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    const handleEventListener = () => {
      if (!textarea) {
        return;
      }

      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    handleEventListener();

    document.addEventListener('input', handleEventListener);
    window.addEventListener('resize', handleEventListener);

    return () => {
      document.removeEventListener('input', handleEventListener);
      window.removeEventListener('resize', handleEventListener);
    };
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      return onEnterPress();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      rows={1}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Untitled"
      className="w-full min-w-0 flex-1 resize-none overflow-hidden border-none bg-transparent px-8 pb-3 pt-10 text-[2.25rem] font-bold leading-tight tracking-tight outline-hidden placeholder:text-muted-foreground/40 focus:outline-hidden focus:ring-0"
    />
  );
};

export const DocumentEditor = () => {
  const { document, documentId, loading } = useDocument();
  const editor = useBlockEditor({});
  const { attributes, loading: attributesLoading } = useDocumentAttributes();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { control } = useFormContext();

  const isCreating = !documentId;
  const hasAttributes = attributes.length > 0;

  const handleEnterPress = () => {
    if (!editor) return;

    editor.focus();
  };

  if (loading) {
    return <DocumentEditorSkeleton />;
  }

  if (!document && !isCreating) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-2 text-center">
          <IconFileText className="size-10 text-muted-foreground/60" />
          <p className="font-medium text-foreground">No document found</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            This document may have been deleted. Pick another from the list to
            keep editing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex flex-none items-start gap-2 overflow-hidden">
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <DocumentTitleEditor
                value={field.value}
                onChange={field.onChange}
                onEnterPress={handleEnterPress}
              />
            )}
          />
          {hasAttributes && !sidebarOpen && (
            <Button
              variant="outline"
              size="sm"
              className="mr-5 mt-10 shrink-0 gap-1.5"
              onClick={() => setSidebarOpen(true)}
            >
              Attributes
              <IconLayoutSidebarRightExpand className="size-4" />
            </Button>
          )}
        </div>
        <DocumentContentEditor
          editor={editor}
          document={document}
          attributes={attributes}
          attributesLoading={attributesLoading}
        />
      </div>
      {hasAttributes && sidebarOpen && (
        <DocumentAttributesSidebar
          editor={editor}
          attributes={attributes}
          loading={attributesLoading}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
