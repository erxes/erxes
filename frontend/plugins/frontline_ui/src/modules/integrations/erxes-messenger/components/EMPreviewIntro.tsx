import {
  erxesMessengerSetupGreetingAtom,
  erxesMessengerSetupHoursAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { IconPlus, IconX } from '@tabler/icons-react';
import { Avatar, Button, Popover, readImage, Separator } from 'erxes-ui';
import { MembersInline, useMembersInlineContext } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { EMGreetingAvatar } from '@/integrations/erxes-messenger/components/EMGreeting';

export const ActiveUsers = () => {
  const { members } = useMembersInlineContext();
  return (
    <div className="flex items-center gap-2">
      {members.map((member) => (
        <Avatar key={member._id} size="xl">
          <Avatar.Image src={readImage(member.details?.avatar || '', 200)} />
          <Avatar.Fallback>
            {member.details?.fullName?.charAt(0) || ''}
          </Avatar.Fallback>
        </Avatar>
      ))}
    </div>
  );
};

export const EMPreviewIntro = () => {
  const greeting = useAtomValue(erxesMessengerSetupGreetingAtom);
  const hours = useAtomValue(erxesMessengerSetupHoursAtom);
  return (
    <>
      <div className="bg-primary text-primary-foreground p-6 pb-16 pt-4">
        <Popover.Close asChild>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4"
          >
            <IconX />
          </Button>
        </Popover.Close>
        <div className="flex items-center gap-1 text-accent mb-2">
          {greeting?.links?.map(
            (link) =>
              !!link && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  asChild
                  key={link.url}
                >
                  <a href={link.url} target="_blank" rel="noreferrer">
                    <EMGreetingAvatar url={link.url} />
                  </a>
                </Button>
              ),
          )}
        </div>
        <h1 className="text-2xl font-semibold">
          {greeting?.title || 'Welcome'}
        </h1>
        <p className="text-sm text-primary-foreground/80 mt-3 mb-5">
          {greeting?.message || 'Welcome to Erxes Messenger'}
        </p>
        <MembersInline.Provider memberIds={greeting?.supporterIds || []}>
          <ActiveUsers />
        </MembersInline.Provider>
      </div>
      <div className="bg-background px-4 py-6 -mt-8 mx-6 rounded-xl shadow-md">
        <div className="font-medium text-accent-foreground mb-2 text-sm px-3">
          Recent conversations
        </div>
        <Button
          className="w-full text-left h-auto justify-start rounded-md px-2 my-2"
          variant="ghost"
        >
          <div className="flex items-center bg-muted text-muted-foreground p-2 rounded-full">
            <IconPlus className="size-5" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <span>Start new conversation</span>
            <span className="text-xs font-normal text-accent-foreground">
              Our usual response time is a few {hours?.responseRate}.
            </span>
          </div>
        </Button>
        <Separator />
      </div>
    </>
  );
};
