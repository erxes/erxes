import { IconMessage2 } from '@tabler/icons-react';
import { Button, Popover, hexToHsl } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { erxesMessengerSetupAppearanceAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMPreviewMessages } from '@/integrations/erxes-messenger/components/EMPreviewMessages';
import { useLayoutEffect } from 'react';
import { erxesMessengerSetupStepAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMPreviewIntro } from '@/integrations/erxes-messenger/components/EMPreviewIntro';

export const ErxesMessengerPreview = () => {
  const appearance = useAtomValue(erxesMessengerSetupAppearanceAtom);
  const erxesMessengerSetupStep = useAtomValue(erxesMessengerSetupStepAtom);

  useLayoutEffect(() => {
    if (hexToHsl(appearance?.color)) {
      document.documentElement.style.setProperty(
        '--primary',
        hexToHsl(appearance?.color) || '',
      );
    }
  }, [appearance]);

  return (
    <div className="bg-sidebar h-dvh flex items-end justify-end p-5">
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
            className="sm:max-w-md w-[calc(100vw-theme(spacing.8))] p-0 max-h-[32rem] h-dvh flex flex-col overflow-hidden shadow-xl rounded-lg"
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
