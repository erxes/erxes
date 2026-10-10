import { Documents } from '@/documents/components/Documents';
import { DocumentsTypes } from '@/documents/components/DocumentsTypes';
import { useSearchParams } from 'react-router-dom';

export const DocumentsContextNavigation = () => {
  const [searchParams] = useSearchParams();

  const documentId = searchParams.get('documentId');
  const contentType = searchParams.get('contentType');
  const showDocumentList = Boolean(contentType && documentId !== null);

  return showDocumentList ? <Documents viewType="list" /> : <DocumentsTypes />;
};
