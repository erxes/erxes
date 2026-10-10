import { useSearchParams } from 'react-router-dom';
import { IDocument } from '../types';

export function useDocumentNavigation(): {
  openDocument: (document: Pick<IDocument, '_id' | 'contentType'>) => void;
  returnToDocuments: () => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  function openDocument(document: Pick<IDocument, '_id' | 'contentType'>) {
    const nextParams = new URLSearchParams(searchParams);

    if (!searchParams.has('documentId')) {
      nextParams.set('listContentType', searchParams.get('contentType') || '');
    }

    nextParams.set('documentId', document._id);
    nextParams.set('contentType', document.contentType);
    setSearchParams(nextParams);
  }

  function returnToDocuments() {
    const nextParams = new URLSearchParams(searchParams);
    const listContentType = searchParams.has('listContentType')
      ? searchParams.get('listContentType')
      : searchParams.get('contentType');

    nextParams.delete('documentId');
    nextParams.delete('listContentType');

    if (listContentType) {
      nextParams.set('contentType', listContentType);
    } else {
      nextParams.delete('contentType');
    }

    setSearchParams(nextParams);
  }

  return { openDocument, returnToDocuments };
}
