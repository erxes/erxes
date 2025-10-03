import {
  IconChevronLeft,
  IconPhone,
  IconSend,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import { Avatar, Button, Input, Popover, Separator, Tooltip } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import {
  erxesMessengerSetupConfigAtom,
  erxesMessengerSetupGreetingAtom,
  erxesMessengerSetupSettingsAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { BrandsInline, MembersInline } from 'ui-modules';

export const EMPreviewMessages = () => {
  const greeting = useAtomValue(erxesMessengerSetupGreetingAtom);
  const settings = useAtomValue(erxesMessengerSetupSettingsAtom);
  const config = useAtomValue(erxesMessengerSetupConfigAtom);

  return (
    <>
      <div className="h-12 flex items-center justify-between py-4 px-2 bg-primary text-primary-foreground">
        <Button size="icon" variant="ghost" className="[&>svg]:size-5">
          <IconChevronLeft />
        </Button>
        <BrandsInline brandIds={[config?.brandId || '']} placeholder="" />
        <div className="ml-auto flex items-center gap-1">
          <Tooltip.Provider>
            {settings?.showVideoCallRequest && (
              <>
                <Tooltip delayDuration={100}>
                  <Tooltip.Trigger asChild>
                    <Button size="icon" variant="ghost">
                      <IconPhone />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Audio call</Tooltip.Content>
                </Tooltip>
                <Tooltip delayDuration={100}>
                  <Tooltip.Trigger asChild>
                    <Button size="icon" variant="ghost">
                      <IconVideo />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Video call</Tooltip.Content>
                </Tooltip>
              </>
            )}
            <Tooltip delayDuration={100}>
              <Tooltip.Trigger asChild>
                <Popover.Close asChild>
                  <Button size="icon" variant="ghost">
                    <IconX />
                  </Button>
                </Popover.Close>
              </Tooltip.Trigger>
              <Tooltip.Content>Close</Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        </div>
      </div>
      <div className="p-4 flex-auto gap-2 flex flex-col justify-end">
        <div className="flex items-end gap-2">
          <MembersInline.Provider
            memberIds={
              greeting?.supporterIds?.length ? [greeting?.supporterIds[0]] : []
            }
          >
            <MembersInline.Avatar size="xl" />
          </MembersInline.Provider>
          <Button
            variant="secondary"
            className="h-auto font-normal flex flex-col justify-start items-start text-left gap-1 p-3"
          >
            <p>Hi, any questions?</p>
            <div className="text-accent-foreground">few minutes ago</div>
          </Button>
        </div>
        <div className="flex items-end gap-2 flex-row-reverse">
          <Avatar size="xl">
            <Avatar.Fallback>C</Avatar.Fallback>
          </Avatar>
          <Button
            variant="secondary"
            className="h-auto font-normal flex flex-col justify-start items-start text-left gap-1 p-3 bg-primary/10"
          >
            <p>We need your help!</p>
            <div className="text-accent-foreground">just now</div>
          </Button>
        </div>
      </div>
      <Separator />
      <div className="relative">
        <Input
          placeholder="Send message..."
          className="focus-visible:shadow-none shadow-none h-12 p-4 pr-12"
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-2 size-8"
        >
          <IconSend />
        </Button>
      </div>
    </>
  );
};
