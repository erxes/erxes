import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';
import { Polygons } from './Polygons';

/** The dark half of the sign-in screen (old core-ui `DynamicBanner`). */
export const AuthBanner = () => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });

  return (
    <div className="relative z-10 hidden h-dvh overflow-hidden bg-foreground lg:block lg:w-1/2 dark:bg-background">
      <Polygons />
      <div className="flex h-full w-full flex-col items-center justify-center text-primary-foreground">
        <div className="absolute top-7">
          <Logo />
        </div>
        <div className="flex max-w-[500px] flex-col justify-center gap-2">
          <h1 className="text-2xl font-semibold leading-7 text-background dark:text-foreground">
            {t('banner-title')}
          </h1>
          <p className="text-lg font-medium leading-6 text-muted-foreground">
            {t('banner-description')}
          </p>
        </div>
      </div>
    </div>
  );
};

/** The form half of the sign-in screen (old core-ui `AuthenticationLayout`). */
export const AuthenticationLayout = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });

  return (
    <div className="relative flex h-dvh flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[radial-gradient(#F0F1FE,#F7F8FA)] py-8 sm:pt-28 lg:w-1/2 lg:flex-none dark:bg-[radial-gradient(#0D0D0D,#161616)]">
      <div className="relative mx-auto flex w-full max-w-md flex-col gap-8 px-1 sm:px-6">
        <div className="absolute inset-0 hidden sm:block">
          <Polygons
            variant="light"
            className="absolute -top-[18.5%] left-1/2 w-[170%] -translate-x-1/2"
          />
        </div>
        <Logo className="relative mx-auto hidden h-10 text-primary sm:block" />
        <div className="relative sm:min-h-144">
          <div className="overflow-hidden rounded-xl bg-sidebar shadow-xl">
            <div className="-mx-px h-full w-auto space-y-6 rounded-b-xl border border-t-0 bg-background p-6 pt-8">
              {children}
            </div>
            <div className="m-0 flex w-full flex-col space-y-1 px-0 py-5 text-accent-foreground">
              <span className="text-center text-sm">{t('accept-terms-prefix')}</span>
              <span className="inline-flex justify-center gap-1 text-center text-sm">
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://erxes.io/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('terms-of-use')}
                </a>
                {t('and')}
                <a
                  className="font-medium text-primary hover:underline"
                  href="https://erxes.io/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('privacy-policy')}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
