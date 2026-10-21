import { DocumentAttributesSidebar } from '@/documents/components/DocumentAttributesSidebar';
import { DocumentEditorSkeleton } from '@/documents/components/DocumentEditorSkeleton';
import { DocumentsErrorState } from '@/documents/components/DocumentsErrorState';
import { useDocument } from '@/documents/hooks/useDocument';
import { useDocumentAttributes } from '@/documents/hooks/useDocumentAttributes';
import {
  ATTRIBUTE_DND_MIME,
  insertAttributeAtPoint,
} from '@/documents/utils/attributeDnd';
import {
  IconFileText,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react';
import {
  Button,
  BlockEditor,
  cn,
  IBlockEditor,
  Textarea,
  toast,
  useBlockEditor,
} from 'erxes-ui';

import { useTranslation } from 'react-i18next';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { AttributeInEditor, usePermissionCheck } from 'ui-modules';
import { DocumentAttribute, IDocument } from '../types';
import { FormType } from '../hooks/useDocumentForm';
import { useDocumentComments } from '../hooks/useDocumentComments';
import {
  DocumentThreadStore,
  restoreDocumentCommentAnchors,
  serializeDocumentComments,
  readDocumentComments,
} from '../utils/DocumentThreadStore';
import { DocumentCommentsSidebar } from './DocumentCommentsSidebar';
import { loadDocumentBlocks } from '../utils/normalizeDocumentBlocks';

const EditorController = ({
  editor,
  onChange,
  attributes,
  loading,
  readonly,
  commentsOpen,
}: {
  editor: IBlockEditor;
  onChange: (value: string) => void;
  attributes: DocumentAttribute[];
  loading: boolean;
  readonly: boolean;
  commentsOpen: boolean;
}) => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);

  useEffect(() => {
    const unsubscribe = editor.onChange((editor: IBlockEditor) => {
      onChange(JSON.stringify(editor.document));
    });

    return unsubscribe;
  }, [editor, onChange]);

  useEffect(() => {
    if (readonly) return;
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
  }, [editor, readonly]);

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
        readonly={readonly}
        floatingThread={!commentsOpen}
        className={cn(
          'document-block-editor w-full flex-1 overflow-y-auto overflow-x-hidden px-5 pb-16',
        )}
      >
        <AttributeInEditor
          editor={editor}
          attributes={attributes}
          loading={loading}
        />
        {commentsOpen && editor.comments && (
          <div className="document-comments-sidebar">
            <p className="px-3 py-2 text-xs text-muted-foreground">
              {t('save-comments-hint')}
            </p>
            <DocumentCommentsSidebar />
          </div>
        )}
      </BlockEditor>
    </div>
  );
};

const DocumentContentEditor = ({
  editor,
  document: documentItem,
  attributes,
  attributesLoading,
  store,
  readonly,
  commentsOpen,
}: {
  editor: IBlockEditor;
  document: IDocument | null;
  attributes: DocumentAttribute[];
  attributesLoading: boolean;
  store: DocumentThreadStore;
  readonly: boolean;
  commentsOpen: boolean;
}) => {
  const { control, setValue } = useFormContext<FormType>();
  const loadingContent = useRef(false);
  const loadedDocument = useRef<{
    id: string | undefined;
    editor: IBlockEditor;
  }>();

  useEffect(() => {
    let cancelled = false;
    loadingContent.current = true;
    const load = async () => {
      try {
        if (
          loadedDocument.current?.id !== documentItem?._id ||
          loadedDocument.current?.editor !== editor
        ) {
          editor.comments?.stopPendingComment();
          editor.comments?.selectThread(undefined);
        }
        loadedDocument.current = { id: documentItem?._id, editor };
        const blocks = await loadDocumentBlocks(editor, documentItem?.content);
        if (cancelled) return;
        editor.replaceBlocks(editor.document, blocks);
        const state = readDocumentComments(documentItem?.commentState);
        store.load(state.threads);
        restoreDocumentCommentAnchors(editor, state.anchors);
      } catch (error) {
        toast({
          title: 'Could not load document content',
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive',
        });
      } finally {
        if (!cancelled) loadingContent.current = false;
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [
    documentItem?._id,
    documentItem?.content,
    documentItem?.commentState,
    editor,
    store,
  ]);

  useEffect(() => {
    const update = () => {
      if (!loadingContent.current && !readonly) {
        setValue('commentState', serializeDocumentComments(editor, store), {
          shouldDirty: true,
        });
      }
    };
    const unsubscribe = store.subscribe(update);
    const unsubscribeEditor = editor.onChange(update);
    return () => {
      unsubscribe();
      unsubscribeEditor?.();
    };
  }, [editor, readonly, setValue, store]);

  return (
    <Controller
      name="content"
      control={control}
      render={({ field }) => (
        <EditorController
          editor={editor}
          onChange={(value) => {
            if (!loadingContent.current) field.onChange(value);
          }}
          attributes={attributes}
          loading={attributesLoading}
          readonly={readonly}
          commentsOpen={commentsOpen}
        />
      )}
    />
  );
};

const DocumentTitleEditor = ({
  value,
  onChange,
  onEnterPress,
  readonly,
}: {
  value: string;
  onChange: (value: string) => void;
  onEnterPress: () => void;
  readonly: boolean;
}) => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
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
    <Textarea
      readOnly={readonly}
      ref={textareaRef}
      value={value}
      rows={1}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={t('untitled')}
      className="w-full min-w-0 flex-1 resize-none overflow-hidden border-none bg-transparent px-8 pb-3 pt-10 text-[2.25rem] font-bold leading-tight tracking-tight outline-hidden placeholder:text-muted-foreground/40 focus:outline-hidden focus:ring-0"
    />
  );
};

export const DocumentEditor = () => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const { document, documentId, hasError, loading, refetch } = useDocument({
    initializeForm: true,
  });
  const { store, resolveUsers } = useDocumentComments();
  const { hasActionPermission } = usePermissionCheck();
  const readonly = !hasActionPermission('manageDocuments');
  const editor = useBlockEditor({
    comments: readonly ? undefined : { threadStore: store },
    resolveUsers,
  });
  const {
    attributes,
    loading: attributesLoading,
    error: attributesError,
    refetch: refetchAttributes,
  } = useDocumentAttributes(document?.contentType);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const { control } = useFormContext<FormType>();

  const isCreating = !documentId;

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
        title={t('load-error-title')}
        description={t('load-error-description')}
        onRetry={() => {
          void refetch().catch(() => undefined);
        }}
      />
    );
  }

  if (!document && !isCreating) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-2 text-center">
          <IconFileText className="size-10 text-muted-foreground/60" />
          <p className="font-medium text-foreground">{t('not-found-title')}</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {t('not-found-description')}
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
                value={field.value || ''}
                onChange={field.onChange}
                onEnterPress={handleEnterPress}
                readonly={readonly}
              />
            )}
          />
          {!readonly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mr-2 mt-10 shrink-0"
              onClick={() => setCommentsOpen((open) => !open)}
            >
              {t('comments')}
            </Button>
          )}
          {!readonly && !sidebarOpen && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mr-5 mt-10 shrink-0 gap-1.5"
              onClick={() => setSidebarOpen(true)}
            >
              {t('attributes')}
              <IconLayoutSidebarRightExpand className="size-4" />
            </Button>
          )}
        </div>
        <DocumentContentEditor
          editor={editor}
          document={document}
          attributes={attributes}
          attributesLoading={attributesLoading}
          store={store}
          readonly={readonly}
          commentsOpen={commentsOpen}
        />
      </div>
      {!readonly && sidebarOpen && (
        <DocumentAttributesSidebar
          editor={editor}
          attributes={attributes}
          loading={attributesLoading}
          error={attributesError}
          onRetry={() => {
            void refetchAttributes().catch(() => undefined);
          }}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
