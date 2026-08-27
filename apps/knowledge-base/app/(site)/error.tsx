'use client';

import { useEffect } from 'react';
import { Button, ButtonLink } from '@/modules/ui/components/Button';
import { Container } from '@/modules/ui/components/Container';
import { Icon } from '@/modules/ui/components/Icon';

/**
 * Server components on this segment read live erxes data, so a failed request
 * has to land somewhere the reader can act on rather than on Next's default
 * error screen.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    /* Surfaced for whoever is watching the browser console during a failure. */
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
      <h1 className="text-2xl font-semibold text-ink">Алдаа гарлаа</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Хуудсыг ачаалж чадсангүй. Дахин оролдоод үзнэ үү, давтагдвал дэмжлэгийн
        багт хандаарай.
      </p>
      {error.digest ? (
        <p className="mt-3 text-[13px] tabular-nums text-muted-foreground">
          Алдааны код: {error.digest}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Дахин оролдох</Button>
        <ButtonLink href="/" variant="secondary">
          Нүүр хуудас
        </ButtonLink>
      </div>
    </Container>
  );
}
