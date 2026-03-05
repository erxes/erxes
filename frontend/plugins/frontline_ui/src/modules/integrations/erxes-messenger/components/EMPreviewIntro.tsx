import {
  erxesMessengerSetupGreetingAtom,
  erxesMessengerSetupHoursAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { Avatar, Button, formatTimeZoneLabel, Popover, readImage } from 'erxes-ui';
import { MembersInline, useMembersInlineContext } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { EMGreetingAvatar } from '@/integrations/erxes-messenger/components/EMGreeting';
import { EMPreviewChatInput } from './EMPreviewChatInput';
import { Weekday } from '../types/Weekday';
import { ScheduleDay } from '../constants/emHoursSchema';
import { format, parse } from 'date-fns';

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

  const formatScheduleDays = (
    obj: Partial<Record<Weekday | ScheduleDay, { work?: boolean; from?: string; to?: string }>>,
  ): string => {
    // Only look at individual weekday keys, not the group synthetic keys
    const WEEKDAY_VALUES = new Set<string>(Object.values(Weekday));

    const activeDays = (Object.keys(obj) as (Weekday | ScheduleDay)[]).filter(
      (key) => WEEKDAY_VALUES.has(key) && obj[key]?.work,
    ) as Weekday[];

    if (activeDays.length === 0) return '';

    const allWeekdays = [
      Weekday.MONDAY,
      Weekday.TUESDAY,
      Weekday.WEDNESDAY,
      Weekday.THURSDAY,
      Weekday.FRIDAY,
    ];
    const weekend = [Weekday.SATURDAY, Weekday.SUNDAY];
    const allDays = [...allWeekdays, ...weekend];

    const hasAll = (set: Weekday[]) =>
      set.every((d) => activeDays.includes(d)) && activeDays.length === set.length;

    if (hasAll(allDays)) return 'Everyday';
    if (hasAll(allWeekdays)) return 'Monday – Friday';
    if (hasAll(weekend)) return 'Weekends';

    // Fallback: capitalise and join the individual day names
    return activeDays
      .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
      .join(', ');
  };

  /** Converts "HH:mm:ss" → "9:00 am" using date-fns */
  const formatTime = (raw: string): string =>
    format(parse(raw, 'HH:mm:ss', new Date()), 'h:mm aa').toLowerCase();

  const getFirstActiveTime = (
    obj: Partial<Record<Weekday | ScheduleDay, { work?: boolean; from?: string; to?: string }>>,
  ): string => {
    const WEEKDAY_VALUES = new Set<string>(Object.values(Weekday));
    const entry = Object.entries(obj).find(
      ([key, value]) => WEEKDAY_VALUES.has(key) && value?.work && value.from && value.to,
    );
    if (!entry) return '9:00 am – 5:00 pm';
    return `${formatTime(entry[1].from!)} – ${formatTime(entry[1].to!)}`;
  };

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
            <p className='text-sm text-medium text-accent-foreground'>
              We're available between {getFirstActiveTime(hours?.onlineHours || {})}
              {formatScheduleDays(hours?.onlineHours || {}) && `, ${formatScheduleDays(hours?.onlineHours || {})}`}
            </p>
          )
        }
        {
          hours?.displayOperatorTimezone && (
            <p className='text-sm text-medium text-accent-foreground'>{formatTimeZoneLabel(hours?.timezone as string) || 'UTC'}</p>
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
