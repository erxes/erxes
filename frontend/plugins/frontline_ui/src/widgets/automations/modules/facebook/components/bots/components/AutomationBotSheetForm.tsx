import { IconPlus } from '@tabler/icons-react';
import { Button, cn, Sheet, useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { AutomationBotForm } from '~/widgets/automations/modules/facebook/components/bots/components/AutomationBotForm';
import { isOpenFacebookBotSecondarySheet } from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotStates';

export const AutomationBotSheetForm = () => {
  const [facebookBotId, setFacebookBotId] =
    useQueryState<string>('facebookBotId');
  const [isOpen, setOpen] = useState(false);
  const isOpenSecondarySheet = useAtomValue(isOpenFacebookBotSecondarySheet);

  useEffect(() => {
    if (facebookBotId) {
      setOpen(true);
    }
  }, [facebookBotId]);

  return (
    <div>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (isOpen && !open) {
            setFacebookBotId(null);
          }
          setOpen(open);
        }}
      >
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            Add Bot
          </Button>
        </Sheet.Trigger>
        <Sheet.View
          className={cn('transition-all duration-300 ease-in-out', {
            'sm:max-w-lg h-[calc(100dvh-4rem)] inset-y-8': isOpenSecondarySheet,
          })}
        >
          {isOpen && <AutomationBotForm facebookBotId={facebookBotId} />}
        </Sheet.View>
      </Sheet>
    </div>
  );
};
