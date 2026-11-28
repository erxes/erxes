import { Spinner } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { Suspense, useState } from 'react';
import { CrashBoundary } from '~/components/CrashBoundary';
import { lazyNamed } from '~/lib/lazyNamed';
import { useCan } from '~/modules/auth/session';
import { assistantOpenState } from './assistantState';

const AssistantPanel = lazyNamed(() => import('./AssistantPanel'), 'AssistantPanel');

export const AssistantHost = () => {
  const open = useAtomValue(assistantOpenState);
  const allowed = useCan()('assistant.chat');
  const [loaded, setLoaded] = useState(open);

  if (open && !loaded) setLoaded(true);

  if (!allowed || !loaded) return null;

  return (
    <CrashBoundary scope="page">
      <Suspense
        fallback={
          open && (
            <div className="absolute top-12 right-2 bottom-2 z-30 flex w-md items-center justify-center rounded-xl border bg-background shadow-xl max-md:hidden">
              <Spinner />
            </div>
          )
        }
      >
        <AssistantPanel open={open} />
      </Suspense>
    </CrashBoundary>
  );
};
