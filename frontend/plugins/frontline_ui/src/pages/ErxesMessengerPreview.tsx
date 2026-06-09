import { EMPreviewMain } from '@/integrations/erxes-messenger/components/EMPreviewIntro';
import { EMPreviewMessages } from '@/integrations/erxes-messenger/components/EMPreviewMessages';
import { useEMIntegrationDetail } from '@/integrations/erxes-messenger/hooks/useEMIntegrationDetail';
import {
  emPreviewChatIsExpanded,
  emPreviewTabAtom,
} from '@/integrations/erxes-messenger/states/emPreviewStates';
import { erxesMessengerSetSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupSetAtom';
import {
  erxesMessengerSetupAppearanceAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import {
  Button,
  ErxesLogoIcon,
  Popover,
  cn,
  hexToOklch,
  readImage,
  useQueryState,
} from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useLayoutEffect } from 'react';

export const ErxesMessengerPreview = () => {
  const appearance = useAtomValue(erxesMessengerSetupAppearanceAtom);
  const [erxesMessengerSetupStep, setErxesMessengerSetupStep] = useAtom(
    erxesMessengerSetupStepAtom,
  );
  const setSetup = useSetAtom(erxesMessengerSetSetupAtom);
  const isChatExpanded = useAtomValue(emPreviewChatIsExpanded);
  const activeStep = useAtomValue(emPreviewTabAtom);

  const [integrationId] = useQueryState<string>('integrationId');

  const { integrationDetail } = useEMIntegrationDetail({
    id: integrationId || '',
  });
  const isExpanded = activeStep === 'chat' && isChatExpanded;
  const isSmall = false;

  useEffect(() => {
    if (integrationId && integrationDetail) {
      setSetup(integrationDetail);
      setErxesMessengerSetupStep(2);
    }
  }, [integrationDetail, integrationId]);

  useLayoutEffect(() => {
    if (
      appearance?.primary?.DEFAULT &&
      hexToOklch(appearance?.primary?.DEFAULT)
    ) {
      document.documentElement.style.setProperty(
        '--primary',
        hexToOklch(appearance?.primary?.DEFAULT) || '',
      );
    }
  }, [appearance]);

  return (
    <div className="bg-accent h-dvh flex items-end justify-end p-5">
      <div>
        <Popover defaultOpen>
          <Popover.Trigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="size-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 [&>svg]:size-5 shadow-md"
            >
              {appearance?.launcherLogo ? (
                <img
                  src={readImage(appearance?.launcherLogo)}
                  alt="em-launcher-logo"
                />
              ) : (
                <ErxesLogoIcon />
              )}
            </Button>
          </Popover.Trigger>

          <Popover.Content
            align="end"
            sideOffset={16}
            className={cn(
              'p-0 flex flex-col overflow-hidden shadow-xl rounded-2xl bg-accent transition-all duration-200',

              // 1. MOBILE LAYOUT
              'max-[420px]:h-[calc(100dvh-72px)] max-[420px]:max-h-none',

              // 2. DESKTOP LAYOUTS (Using 100dvh instead of 100%)
              'min-[421px]:min-h-20',
              {
                // Case A: Expanded view
                'min-[421px]:w-[min(688px,max(0px,-20px+100dvw))] min-[421px]:h-[calc(100dvh-104px)] min-[421px]:max-h-[calc(100dvh-104px)]':
                  isExpanded,

                // Case B: Small view
                'min-[421px]:w-[min(400px,max(0px,-20px+100dvw))] min-[421px]:h-[min(704px,100dvh-104px)] min-[421px]:max-h-[310px]':
                  isSmall && !isExpanded,

                // Case C: Standard Shown view (This fixes the look in your screenshot!)
                'min-[421px]:w-[min(400px,max(0px,-20px+100dvw))] min-[421px]:h-[min(704px,100dvh-104px)] min-[421px]:max-h-[704px]':
                  !isExpanded && !isSmall,
              },
            )}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <EMPreviewMain />
          </Popover.Content>
        </Popover>
      </div>
    </div>
  );
};
