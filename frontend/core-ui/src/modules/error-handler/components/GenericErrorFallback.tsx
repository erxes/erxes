import { Polygons } from '@/auth/components/Polygons';
import { Button, cn } from 'erxes-ui';
import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { FallbackProps } from 'react-error-boundary';

type GenericErrorFallbackProps = FallbackProps & {
  title?: string;
  children?: ReactNode;
};

export const GenericErrorFallback = ({
  resetErrorBoundary,
  error,
  title = 'Sorry, something went wrong',
  children,
}: GenericErrorFallbackProps) => {
  return (
    <div className="h-dvh w-dvw p-2 bg-sidebar">
      <div className="flex flex-col items-center justify-center h-full w-full shadow-sm rounded-lg relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full overflow-hidden bg-[radial-gradient(50%_100%_at_50%_0%,#F0F1FE_0%,#F7F8FA_100%)] dark:bg-[radial-gradient(50%_100%_at_50%_0%,#0D0D0D_0%,#161616_100%)]"
        >
          <Polygons
            variant="welcome"
            className="absolute top-0 left-1/2 -translate-x-1/2"
          />
        </motion.div>
        <div
          className={cn(
            'relative z-10 text-center max-w-md',
            children ? 'mb-6' : 'pb-20',
          )}
        >
          <h1 className="mb-2 text-xl font-semibold text-foreground">
            {title}
          </h1>
          <p className="mb-4 text-muted-foreground">{error?.message}</p>
          <Button onClick={resetErrorBoundary}>Try Again</Button>
        </div>
        {children && (
          <div className="relative z-10 flex w-full justify-center pb-20">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
