import { Spinner } from 'erxes-ui';
import { useFileDocxPreview } from '../hooks/useFileDocxPreview';

export const FileDocxPreview = ({ url }: { url: string }) => {
  const { containerRef, loading, error } = useFileDocxPreview(url);

  return (
    <div className="relative h-full w-full overflow-auto">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {error && <div className="p-4 text-sm text-destructive">{error}</div>}
      <div ref={containerRef} />
    </div>
  );
};
