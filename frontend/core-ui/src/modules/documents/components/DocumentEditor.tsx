import { DocumentAttributesSidebar } from '@/documents/components/DocumentAttributesSidebar';
import { DocumentEditorSkeleton } from '@/documents/components/DocumentEditorSkeleton';
import { DocumentsErrorState } from '@/documents/components/DocumentsErrorState';
import { useDocument } from '@/documents/hooks/useDocument';
import { useDocumentAttributes } from '@/documents/hooks/useDocumentAttributes';
import { useDocumentComments } from '@/documents/hooks/useDocumentComments';
import { FormType } from '@/documents/hooks/useDocumentForm';
import { DocumentThreadStore } from '@/documents/utils/DocumentThreadStore';
import type { IDocument } from '@/documents/types';
import {
  normalizeDocumentBlocks,
  StoredDocumentBlock,
} from '@/documents/utils/normalizeDocumentBlocks';
import {
  ATTRIBUTE_DND_MIME,
  insertAttributeAtPoint,
} from '@/documents/utils/attributeDnd';
import {
  IconFileText,
  IconMessage,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react';
import {
  Button,
  BlockEditor,
  cn,
  IBlockEditor,
  toast,
  useBlockEditor,
} from 'erxes-ui';
import { Popover } from 'erxes-ui/components';

import {
  ChangeEvent,
  ComponentProps,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { AttributeInEditor } from 'ui-modules';
import {
  DocumentComments,
  DocumentCommentsPanel,
  DocumentCommentsProvider,
  isDocumentCommentOverlay,
} from './DocumentComments';

type DocumentEditorAttributes = NonNullable<
  ComponentProps<typeof AttributeInEditor>['attributes']
>;

const EditorController = ({
  editor,
  onChange,
  attributes,
  loading,
}: {
  editor: IBlockEditor;
  onChange: (value: string) => void;
  attributes: DocumentEditorAttributes;
  loading: boolean;
}) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

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
      <Popover open={commentsOpen} onOpenChange={setCommentsOpen}>
        <div className="flex flex-none justify-end gap-2 px-5 py-2">
          <Popover.Trigger asChild>
            <Button type="button" variant="outline" size="sm">
              <IconMessage /> Comments
            </Button>
          </Popover.Trigger>
        </div>
        <BlockEditor
          editor={editor}
          comments={false}
          className="w-full flex-1 overflow-y-auto overflow-x-hidden px-5 pb-16"
        >
          <DocumentCommentsProvider>
            <DocumentComments editor={editor} panelOpen={commentsOpen} />
            <Popover.Content
              className="document-comments-panel bn-container w-96 max-h-96 overflow-y-auto"
              align="end"
              onInteractOutside={(event) => {
                if (isDocumentCommentOverlay(event.target))
                  event.preventDefault();
              }}
            >
              <DocumentCommentsPanel editor={editor} />
            </Popover.Content>
          </DocumentCommentsProvider>
          <AttributeInEditor
            editor={editor}
            attributes={attributes}
            loading={loading}
          />
        </BlockEditor>
      </Popover>
    </div>
  );
};

const DocumentContentEditor = ({
  editor,
  document,
  attributes,
  attributesLoading,
  threadStore,
}: {
  editor: IBlockEditor;
  document: IDocument | null;
  attributes: DocumentEditorAttributes;
  attributesLoading: boolean;
  threadStore: DocumentThreadStore;
}) => {
  const { control, setValue } = useFormContext<FormType>();

  useEffect(() => {
    const content = document?.content;
    if (!content || !editor) return;

    const loadInitialContent = async () => {
      let blocks: StoredDocumentBlock[];

      try {
        blocks = JSON.parse(content);
      } catch {
        try {
          blocks = await editor.tryParseHTMLToBlocks(content);
        } catch {
          blocks = await editor.tryParseMarkdownToBlocks(content);
        }
      }

      editor.replaceBlocks(editor.document, normalizeDocumentBlocks(blocks));
      try {
        threadStore.load(document?.commentData, editor);
        setValue('commentData', threadStore.serialize(editor));
      } catch (error) {
        toast({
          title: 'Could not load document comments',
          description:
            error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        });
      }
    };

    loadInitialContent();
  }, [document?.content, document?.commentData, editor, threadStore, setValue]);

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
  const { document, documentId, hasError, loading, refetch } = useDocument();
  const { threadStore, resolveUsers, connectEditor } = useDocumentComments();
  const editor = useBlockEditor({ comments: { threadStore }, resolveUsers });
  const { attributes, loading: attributesLoading } = useDocumentAttributes();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { control } = useFormContext();

  useEffect(() => connectEditor(editor), [connectEditor, editor]);

  const isCreating = !documentId;
  const hasAttributes = attributes.length > 0;

  const handleEnterPress = () => {
    if (!editor) return;

    editor.focus();
  };

  if (loading) {
    return <DocumentEditorSkeleton />;
  }

  if (hasError) {
    return (
      <DocumentsErrorState
        title="Couldn’t load document"
        description="Check your connection and try again."
        onRetry={refetch}
      />
    );
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
          threadStore={threadStore}
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
