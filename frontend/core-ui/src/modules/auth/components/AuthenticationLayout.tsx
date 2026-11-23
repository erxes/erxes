import { Logo } from '@/auth/components/Logo';
import { NAVIGATION_EASE } from '@/navigation/constants/navigationMotion';
import { motion, useReducedMotion } from 'framer-motion';
import { Polygons } from './Polygons';
import { useTranslation } from 'react-i18next';

interface AuthenticationLayoutProps {
  children: React.ReactNode;
}
export const AuthenticationLayout = ({
  children,
}: AuthenticationLayoutProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative flex h-dvh flex-1 flex-col overflow-x-hidden overflow-y-auto bg-[radial-gradient(ellipse_at_top,#ECEEFE_0%,#F6F7FB_58%,#F3F4F8_100%)] py-8 sm:pt-24 lg:w-1/2 lg:flex-none dark:bg-[radial-gradient(ellipse_at_top,#1B1C28_0%,#131317_55%,#0F0F12_100%)]">
      <div
        aria-hidden
        className="ui-orb-float pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
      />
      <div className="relative mx-auto flex w-full max-w-md flex-col gap-7 px-3 sm:px-6">
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          <Polygons
            variant="light"
            className="absolute -top-[18.5%] left-1/2 w-[170%] -translate-x-1/2 opacity-80"
          />
        </div>
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: NAVIGATION_EASE }}
          className="relative hidden sm:block"
        >
          <Logo className="mx-auto h-10 text-primary drop-shadow-xs transition-transform duration-200 hover:scale-[1.03]" />
        </motion.div>
        <motion.div
          initial={
            prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.985 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.05, ease: NAVIGATION_EASE }}
          className="relative sm:min-h-144"
        >
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-sidebar/90 shadow-xl ring-1 ring-primary/5 backdrop-blur-md dark:border-border/60 dark:bg-sidebar/80">
            <div className="overflow-hidden">
              <div className="-mx-px h-full w-auto space-y-6 rounded-b-2xl border border-t-0 border-border/70 bg-background/95 p-6 pt-8 shadow-xs backdrop-blur-sm">
                {children}
              </div>
              <div className="m-0 flex w-full flex-col space-y-1 px-4 py-5 text-muted-foreground">
                <span className="text-center text-xs">
                  {t('accept-terms-prefix')}
                </span>
                <span className="inline-flex justify-center gap-1 text-center text-xs">
                  <a
                    className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
                    href="https://erxes.io/legal/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('terms-of-use')}
                  </a>
                  {t('and')}
                  <a
                    className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
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
        </motion.div>
      </div>
    </div>
  );
};
