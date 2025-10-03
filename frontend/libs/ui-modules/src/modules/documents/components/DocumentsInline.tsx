import {
  isUndefinedOrNull,
  Skeleton,
  TextOverflowTooltip,
  Tooltip,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import {
  DocumentsInlineContext,
  useDocumentsInlineContext,
} from 'ui-modules/modules/documents/contexts/DocumentsInlineContext';
import { useDocumentInline } from 'ui-modules/modules/documents/hooks/useDocumentInline';

const DocumentsInlineRoot = (props: any) => {
  return (
    <DocumentsInlineProvider {...props}>
      <DocumentsInlineTitle />
    </DocumentsInlineProvider>
  );
};

const DocumentsInlineProvider = ({
  children,
  documentIds,
  documents,
  placeholder,
  updateDocuments,
}: any & {
  children?: React.ReactNode;
}) => {
  const [_documents, _setDocuments] = useState<any[]>(documents || []);

  return (
    <DocumentsInlineContext.Provider
      value={{
        documents: documents || _documents,
        loading: false,
        documentIds: documentIds || [],
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select documents'
          : placeholder,
        updateDocuments: updateDocuments || _setDocuments,
      }}
    >
      {children}
      {documentIds?.map((documentId) => (
        <DocumentsInlineEffectComponent
          key={documentId}
          documentId={documentId}
        />
      ))}
    </DocumentsInlineContext.Provider>
  );
};

const DocumentsInlineEffectComponent = ({
  documentId,
}: {
  documentId: string;
}) => {
  const { documents, updateDocuments } = useDocumentsInlineContext();
  const { document } = useDocumentInline({
    variables: {
      _id: documentId,
    },
    skip: !documentId || documents.some((b) => b._id === documentId),
  });

  useEffect(() => {
    const newDocuments = [...documents].filter((b) => b._id !== documentId);

    if (document) {
      updateDocuments?.([...newDocuments, document]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document]);

  return null;
};

const DocumentsInlineTitle = () => {
  const { documents, loading, placeholder } = useDocumentsInlineContext();

  if (loading) {
    return <Skeleton className="w-full flex-1 h-4" />;
  }

  if (documents.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (documents.length < 3) {
    return (
      <TextOverflowTooltip
        value={documents.map((document) => document.name).join(', ')}
      />
    );
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span>{`${documents.length} documents`}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {documents.map((document) => document.name).join(', ')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const DocumentsInline = Object.assign(DocumentsInlineRoot, {
  Provider: DocumentsInlineProvider,
  Title: DocumentsInlineTitle,
});
