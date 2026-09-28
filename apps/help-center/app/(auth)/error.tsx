'use client';

import { useEffect } from 'react';
import { useT } from '@/modules/i18n/components/LocaleProvider';
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
  const t = useT();

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
      <h1 className="text-xl font-semibold text-ink">{t('error.authTitle')}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {t('error.authText')}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>{t('common.tryAgain')}</Button>
        <ButtonLink href="/" variant="secondary">
          {t('common.homePage')}
        </ButtonLink>
      </div>
    </Container>
  );
}
