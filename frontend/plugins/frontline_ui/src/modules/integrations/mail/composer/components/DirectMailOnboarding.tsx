import { FrontlinePaths } from '@/types/FrontlinePaths';
import { IconSparkles, IconX } from '@tabler/icons-react';
import { Button, Dialog, getPluginAssetsUrl } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { usePermissionCheck } from 'ui-modules';

interface DirectMailOnboardingProps {
  onClose: () => void;
}

export const DirectMailOnboarding = ({
  onClose,
}: DirectMailOnboardingProps) => {
  const { t } = useTranslation('frontline');
  const { hasActionPermission } = usePermissionCheck();
  const canConfigure = hasActionPermission('integrationsEdit');
  const settingsPath = `/settings/${FrontlinePaths.Frontline}`;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[440px] sm:max-w-[440px] overflow-y-auto rounded-[20px] gap-0 p-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-10 size-7 rounded-full text-muted-foreground"
          aria-label={t('mail-onboarding-close', 'Close email setup')}
          onClick={onClose}
        >
          <IconX className="size-4" />
        </Button>
        <div
          className="relative isolate flex min-h-[216px] items-center justify-center overflow-hidden px-6 pb-2 pt-5"
          aria-hidden="true"
        >
          <span className="absolute h-[168px] w-[208px] -rotate-24 scale-y-[0.72] rounded-full border border-primary/15" />
          <IconSparkles className="absolute left-[14%] top-[20%] size-4 text-primary/60 motion-safe:animate-pulse" />
          <IconSparkles className="absolute right-[12%] top-[33%] size-3 text-primary/60 motion-safe:animate-pulse [animation-delay:-2s]" />
          <IconSparkles className="absolute bottom-[18%] left-[20%] size-2.5 text-primary/60 motion-safe:animate-pulse [animation-delay:-4s]" />
          <img
            src={getPluginAssetsUrl(
              'frontline',
              'email-onboarding-astronaut-v2.webp',
            )}
            alt=""
            width={256}
            height={256}
            className="relative z-10 size-48 max-w-full object-contain motion-safe:animate-bot-rock [animation-duration:6s]"
          />
        </div>
        <div className="flex flex-col items-center px-6 pb-7 sm:px-9">
          <Dialog.Header className="items-center gap-3 space-y-0 text-center">
            <Dialog.Title className="text-2xl font-semibold leading-tight tracking-tight text-center">
              {t('mail-onboarding-title', 'Connect your email')}
            </Dialog.Title>
            <Dialog.Description className="max-w-xs text-sm leading-6 text-muted-foreground text-center">
              {canConfigure
                ? t(
                    'mail-onboarding-description',
                    'Connect an inbox to send your first email. Start by setting up your sending domain.',
                  )
                : t(
                    'mail-onboarding-admin',
                    'No email inbox is available to you yet. Ask your workspace administrator to connect one or give you access.',
                  )}
            </Dialog.Description>
          </Dialog.Header>
          {canConfigure && (
            <div className="mt-6 flex flex-col gap-4 w-full">
              <Button
                type="button"
                size="lg"
                className="h-11 w-full justify-center rounded-lg px-4 shadow-none [text-shadow:none] before:hidden after:hidden"
                asChild
              >
                <Link
                  to={`${settingsPath}${FrontlinePaths.IntegrationConfig}`}
                  onClick={onClose}
                >
                  {t('mail-onboarding-configure', 'Set up email')}
                </Link>
              </Button>
              <p className="text-xs leading-5 text-muted-foreground text-center">
                {t(
                  'mail-onboarding-already-configured',
                  'Sending already set up?',
                )}{' '}
                <Link
                  to={`${settingsPath}${FrontlinePaths.Channels}`}
                  onClick={onClose}
                  className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {t('mail-onboarding-channels', 'Connect an inbox')}
                </Link>
              </p>
            </div>
          )}
          <Dialog.Footer className="mt-5 justify-center sm:justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-fit px-0 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={onClose}
            >
              {t('mail-onboarding-later', 'Maybe later')}
            </Button>
          </Dialog.Footer>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
