import {
  erxesMessengerSetupGreetingAtom,
  erxesMessengerSetupHoursAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { IconX } from '@tabler/icons-react';
import { Avatar, Button, Popover, readImage } from 'erxes-ui';
import { MembersInline, useMembersInlineContext } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { EMGreetingAvatar } from '@/integrations/erxes-messenger/components/EMGreeting';
import { EMPreviewChatInput } from './EMPreviewChatInput';
import { Weekday } from '../types/Weekday';
import { ScheduleDay } from '../constants/emHoursSchema';
import { formatDate } from 'date-fns';

const MAX_COUNT = 2;

export const ActiveUsers = () => {
  const { members } = useMembersInlineContext();
  const extraCount = members.length - MAX_COUNT;
  return (
    <div className="flex items-center -space-x-2">
      {members.slice(0, MAX_COUNT).map((member) => (
        <Avatar key={member._id} size="xl" className='border-2 border-transparent'>
          <Avatar.Image src={readImage(member.details?.avatar || '', 200)} />
          <Avatar.Fallback>
            {member.details?.fullName?.charAt(0) || ''}
          </Avatar.Fallback>
        </Avatar>
      ))}
      {extraCount > 0 && (
        <Avatar size="xl" className='border-2 border-transparent'>
          <Avatar.Fallback>
            {'+' + extraCount}
          </Avatar.Fallback>
        </Avatar>
      )}
    </div>
  );
};

export const EMPreviewIntro = () => {
  const greeting = useAtomValue(erxesMessengerSetupGreetingAtom);
  const hours = useAtomValue(erxesMessengerSetupHoursAtom);

  const getSchedule = (obj: Partial<Record<Weekday | ScheduleDay, { work?: boolean | undefined; from?: string | undefined; to?: string | undefined; }>>) => {
    const days = Object.entries(obj).filter(([_, value]) => value.work).map(([key, _]) => key);
    const times = Object.entries(obj).filter(([_, value]) => value.work).map(([_, value]) => `${value.from} - ${value.to}`);
    return {
      days,
      times
    }
  }

  return (
    <>
      <div className="bg-background text-foreground p-6 pt-4 space-y-3">
        <h1 className="font-semibold text-accent-foreground text-base">
          {greeting?.title || 'Need help?'}
        </h1>
        <p className="text-sm text-foreground/80">
          {greeting?.message || 'Welcome to Erxes Messenger'}
        </p>
        {
          hours?.availabilityMethod === 'manual' ? (
            <p className='text-sm text-medium text-accent-foreground'>We're available between 9.00 pm and 5.00 am</p>
          ) : (
            <p className='text-sm text-medium text-accent-foreground'>We're available between {getSchedule(hours?.onlineHours || {}).times[0] || '9.00 am - 5.00 pm'}, {getSchedule(hours?.onlineHours || {}).days.join(', ') || ''}</p>
          )
        }
        <p className="text-xs text-accent-foreground">
          Contact us for any questions or concerns.
        </p>
        <div className="flex items-center gap-1 text-accent">
          {greeting?.links?.map(
            (link) =>
              !!link && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4"
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
      </div>
      <div className="flex items-center gap-2 flex-1 justify-start px-4">
        <MembersInline.Provider memberIds={greeting?.supporterIds || []}>
          <ActiveUsers />
        </MembersInline.Provider>
        <span className="text-xs text-accent-foreground">
          Our usual reply time <span className="font-medium text-primary">(A few {hours?.responseRate || 'minutes'})</span>
        </span>
      </div>
      <div className="mt-auto">
        <EMPreviewChatInput />
      </div>
    </>
  );
};
