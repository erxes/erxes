import { Spinner } from 'erxes-ui';

interface LogLoadingProps {
  message?: string;
}

export function LogLoading({ message = 'Loading...' }: LogLoadingProps) {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-primary" />
        <p className="text-sm text-muted-foreground font-medium">{message}</p>
      </div>
    </div>
  );
}

