import {
  isUndefinedOrNull,
  Skeleton,
  TextOverflowTooltip,
  Tooltip,
} from 'erxes-ui';
import { useEffect, useState, ReactNode } from 'react';
import {
  DocumentsInlineContext,
  useDocumentsInlineContext,
} from 'ui-modules/modules/documents/contexts/DocumentsInlineContext';
import { useDocumentInline } from 'ui-modules/modules/documents/hooks/useDocumentInline';

export type Document = {
  _id: string;
  name: string;
};

interface DocumentsInlineProviderProps {
  children?: ReactNode;
  documentIds?: string[];
  documents?: Document[];
  placeholder?: string;
  updateDocuments?: (documents: Document[]) => void;
}

const DocumentsInlineRoot = (props: DocumentsInlineProviderProps) => {
  return (
    <DocumentsInlineProvider {...props}>
      <DocumentsInlineTitle />
    </DocumentsInlineProvider>
  );
};

const DocumentsInlineProvider = ({
  children,
  documentIds = [],
  documents = [],
  placeholder,
  updateDocuments,
}: DocumentsInlineProviderProps) => {
  const [_documents, _setDocuments] = useState<Document[]>(documents);

  return (
    <DocumentsInlineContext.Provider
      value={{
        documents: documents.length > 0 ? documents : _documents,
        loading: false,
        documentIds,
        placeholder: isUndefinedOrNull(placeholder)
          ? 'Select documents'
          : placeholder,
        updateDocuments: updateDocuments || _setDocuments,
      }}
    >
      {children}
      {documentIds.map((documentId) => (
        <DocumentsInlineEffectComponent
          key={documentId}
          documentId={documentId}
        />
      ))}
    </DocumentsInlineContext.Provider>
  );
};

interface DocumentsInlineEffectComponentProps {
  documentId: string;
}

const DocumentsInlineEffectComponent = ({
  documentId,
}: DocumentsInlineEffectComponentProps) => {
  const { documents, updateDocuments } = useDocumentsInlineContext();
  const { document } = useDocumentInline({
    variables: { _id: documentId },
    skip: !documentId || documents.some((b) => b._id === documentId),
  });

  useEffect(() => {
    const newDocuments = documents.filter((b) => b._id !== documentId);

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
