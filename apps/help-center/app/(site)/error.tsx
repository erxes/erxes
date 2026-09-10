'use client';

import { useEffect } from 'react';
import { Button, ButtonLink } from '@/modules/ui/components/Button';
import { Container } from '@/modules/ui/components/Container';
import { Icon } from '@/modules/ui/components/Icon';

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <Container
      width="text"
      className="flex flex-col items-center py-24 text-center"
    >
      <span className="mb-6 flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Icon name="alert" size={26} />
      </span>
      <h1 className="text-2xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        The page could not be loaded. Please try again, and contact the support
        team if it keeps happening.
      </p>
      {error.digest ? (
        <p className="mt-3 text-[13px] tabular-nums text-muted-foreground">
          Error code: {error.digest}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Home page
        </ButtonLink>
      </div>
    </Container>
  );
}
