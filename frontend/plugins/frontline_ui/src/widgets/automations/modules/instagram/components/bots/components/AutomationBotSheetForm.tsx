import { IconPlus } from '@tabler/icons-react';
import { Button, cn, Sheet, useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { AutomationBotForm } from '~/widgets/automations/modules/instagram/components/bots/components/AutomationBotForm';
import { isOpenInstagramBotSecondarySheet } from '~/widgets/automations/modules/instagram/components/bots/states/instagramBotStates';

export const AutomationBotSheetForm = () => {
  const [instagramBotId, setInstagramBotId] =
    useQueryState<string>('instagramBotId');
  const [isOpen, setOpen] = useState(false);
  const isOpenSecondarySheet = useAtomValue(isOpenInstagramBotSecondarySheet);

  useEffect(() => {
    if (instagramBotId) {
      setOpen(true);
    }
  }, [instagramBotId]);

  return (
    <div>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (isOpen && !open) {
            setInstagramBotId(null);
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
          {isOpen && <AutomationBotForm instagramBotId={instagramBotId} />}
        </Sheet.View>
      </Sheet>
    </div>
  );
};
