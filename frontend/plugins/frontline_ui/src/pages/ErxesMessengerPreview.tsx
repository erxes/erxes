import { IconMessage2 } from '@tabler/icons-react';
import { Button, Popover, hexToOklch, useQueryState } from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { erxesMessengerSetupAppearanceAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMPreviewMessages } from '@/integrations/erxes-messenger/components/EMPreviewMessages';
import { useEffect, useLayoutEffect } from 'react';
import { erxesMessengerSetupStepAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMPreviewIntro } from '@/integrations/erxes-messenger/components/EMPreviewIntro';
import { useEMIntegrationDetail } from '@/integrations/erxes-messenger/hooks/useEMIntegrationDetail';
import { erxesMessengerSetSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupSetAtom';

export const ErxesMessengerPreview = () => {
  const appearance = useAtomValue(erxesMessengerSetupAppearanceAtom);
  const [erxesMessengerSetupStep, setErxesMessengerSetupStep] = useAtom(erxesMessengerSetupStepAtom);
  const setSetup = useSetAtom(erxesMessengerSetSetupAtom);

  const [integrationId] = useQueryState<string>('integrationId');

  const { integrationDetail } = useEMIntegrationDetail({
    id: integrationId || '',
  });

  useEffect(() => {
    if (integrationId && integrationDetail) {
      setSetup(integrationDetail);
      setErxesMessengerSetupStep(2);
    }
  }, [integrationDetail, integrationId]);

  console.log(integrationDetail);
  console.log(appearance);

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
              <IconMessage2 />
            </Button>
          </Popover.Trigger>
          <Popover.Content
            align="end"
            sideOffset={16}
            className="sm:max-w-md w-[calc(100vw-(--spacing(8)))] p-0 max-h-128 h-dvh flex flex-col overflow-hidden shadow-xl rounded-xl bg-accent"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            {[1, 3, 5, 6].includes(erxesMessengerSetupStep) && (
              <EMPreviewMessages />
            )}
            {[2, 4].includes(erxesMessengerSetupStep) && <EMPreviewIntro />}
          </Popover.Content>
        </Popover>
      </div>
    </div>
  );
};
