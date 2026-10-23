import { useEffect, useState } from 'react';

interface IPdfPreviewProps {
  blob: Blob;
}

export const PdfPreview = ({ blob }: IPdfPreviewProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [blob]);

  if (!objectUrl) {
    return null;
  }

  return (
    <iframe
      title="PDF artifact preview"
      src={objectUrl}
      className="h-full w-full rounded-lg border"
    />
  );
};
