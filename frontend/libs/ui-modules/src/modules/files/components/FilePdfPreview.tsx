import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { Spinner } from 'erxes-ui';
import { useFilePdfPage } from '../hooks/useFilePdfPage';
import { useFilePdfPreview } from '../hooks/useFilePdfPreview';

const FilePdfPage = ({
  doc,
  pageNumber,
}: {
  doc: PDFDocumentProxy;
  pageNumber: number;
}) => {
  const { ref, canvasRef, rendered, error } = useFilePdfPage(doc, pageNumber);

  return (
    <div
      ref={ref}
      className={`relative w-full max-w-[900px] bg-background shadow-sm ${
        rendered ? '' : 'aspect-[1/1.414]'
      }`}
    >
      <canvas
        ref={canvasRef}
        className={rendered ? 'block h-auto w-full' : 'hidden'}
      />
      {!rendered && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {error && <div className="p-4 text-sm text-destructive">{error}</div>}
    </div>
  );
};

export const FilePdfPreview = ({ url }: { url: string }) => {
  const { doc, pageNumbers, loading, error } = useFilePdfPreview(url);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !doc) {
    return <div className="p-4 text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="flex h-full w-full flex-col items-center gap-4 overflow-auto p-4">
      {pageNumbers.map((pageNumber) => (
        <FilePdfPage key={pageNumber} doc={doc} pageNumber={pageNumber} />
      ))}
    </div>
  );
};
