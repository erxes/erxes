import { IconCaretLeftRight } from '@tabler/icons-react';
import { Button, ScrollArea, Spinner } from 'erxes-ui';
import { useInView } from 'react-intersection-observer';
import { useGetTriages } from '@/triage/hooks/useGetTriages';
import { TriageHeader } from './TriageHeader';
import { TriageItem } from './TriageItem';

export const Triages = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden w-full">
      <TriageHeader />
      <TriageList />
    </div>
  );
};

const TriageList = () => {
  const { triages, loading, handleFetchMore, totalCount } = useGetTriages();
  const { ref: inViewRef } = useInView({
    onChange: (inView) => {
      if (inView) {
        handleFetchMore();
      }
    },
  });

  if (!loading && triages.length === 0) {
    return (
      <div className="h-full w-full flex flex-col gap-4 justify-center items-center text-accent-foreground">
        <div className="border border-dashed p-6 bg-sidebar rounded-xl">
          <IconCaretLeftRight />
        </div>
        <span className="text-sm">No triages to display at the moment.</span>
      </div>
    );
  }

  return (
    <ScrollArea.Root className="w-full h-full overflow-hidden relative bg-sidebar">
      {loading ? (
        <Spinner />
      ) : (
        <ScrollArea.Viewport className="[&>div]:!block">
          <div className="py-3 px-4 flex flex-col gap-2 w-full overflow-hidden">
            {triages.map((triage) => (
              <TriageItem key={triage._id} {...triage} />
            ))}
            {!loading && triages?.length > 0 && totalCount > triages.length && (
              <Button
                variant="ghost"
                ref={inViewRef}
                className="h-8 w-full text-muted-foreground"
                asChild
              >
                <div>
                  <Spinner containerClassName="inline-flex flex-none" />
                  loading more...
                </div>
              </Button>
            )}
          </div>
        </ScrollArea.Viewport>
      )}

      <ScrollArea.Bar orientation="vertical" />
    </ScrollArea.Root>
  );
};
