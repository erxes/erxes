'use client';

import { useEffect } from 'react';
import { Button, ButtonLink } from '@/modules/ui/components/Button';
import { Container } from '@/modules/ui/components/Container';
import { Icon } from '@/modules/ui/components/Icon';

export default function AuthError({
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
      width="form"
      className="flex flex-1 flex-col items-center justify-center py-24 text-center"
    >
      <span className="mb-6 flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Icon name="alert" size={26} />
      </span>
      <h1 className="text-xl font-semibold text-ink">Хуудсыг нээж чадсангүй</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Дахин оролдоод үзнэ үү.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Дахин оролдох</Button>
        <ButtonLink href="/" variant="secondary">
          Нүүр хуудас
        </ButtonLink>
      </div>
    </Container>
  );
}
