import { useTranslation } from 'react-i18next';
import {
  erxesMessengerSetupAppearanceAtom,
  erxesMessengerSetupConfigAtom,
  erxesMessengerSetupGreetingAtom,
  erxesMessengerSetupHoursAtom,
  erxesMessengerSetupIntroAtom,
  erxesMessengerSetupSettingsAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { cva } from 'class-variance-authority';
import {
  Avatar,
  Badge,
  Button,
  cn,
  Empty,
  ErxesLogoIcon,
  formatTimeZoneLabel,
  IconComponent,
  InfoCard,
  Input,
  Label,
  PhoneInput,
  readImage,
  Spinner,
  Tabs,
  Tooltip,
} from 'erxes-ui';
import { MembersInline, useMembersInlineContext } from 'ui-modules';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { EMGreetingAvatar } from '@/integrations/erxes-messenger/components/EMGreeting';
import { EMPreviewChatInput } from './EMPreviewChatInput';
import { Weekday } from '../types/Weekday';
import { ScheduleDay } from '../constants/emHoursSchema';
import { format, parse } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  IconArrowRight,
  IconBook,
  IconBookmark,
  IconCircleMinus,
  IconHelp,
  IconHelpCircle,
  IconHome,
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconSend,
  IconTicket,
} from '@tabler/icons-react';
import {
  emPreviewHasChatContext,
  emPreviewTabAtom,
  emPreviewWebsiteAppHeaderTitle,
  emPreviewWebsiteAppUrl,
} from '../states/emPreviewStates';
import { useQuery } from '@apollo/client';
import { GET_KNOWLEDGE_BASE_TOPIC_DETAILS } from '@/knowledgebase/graphql/queries';
import { IKnowledgeBaseTopic } from '@/knowledgebase/types';
import { EMPreviewWebsiteApp } from './EMPreviewWebsiteApp';
import { EMPreviewMessages } from './EMPreviewMessages';

const heroBackgroundVariants = cva('', {
  variants: {
    variant: {
      glossy:
        'bg-[radial-gradient(120%_80%_at_88%_-10%,color-mix(in_oklch,var(--color-primary-foreground)_18%,transparent)_0%,transparent_55%),radial-gradient(80%_60%_at_10%_110%,color-mix(in_oklch,var(--color-primary)_22%,transparent)_0%,transparent_60%),linear-gradient(180deg,var(--color-hero)_0%,color-mix(in_oklch,var(--color-hero)_75%,black)_70%,color-mix(in_oklch,var(--color-hero)_60%,black)_100%)]',
      aurora:
        'bg-[radial-gradient(60%_50%_at_80%_20%,color-mix(in_oklch,var(--color-primary)_55%,transparent)_0%,transparent_60%),radial-gradient(60%_60%_at_15%_110%,color-mix(in_oklch,var(--color-destructive)_45%,transparent)_0%,transparent_60%),linear-gradient(180deg,var(--color-hero)_0%,color-mix(in_oklch,var(--color-hero)_70%,black)_100%)]',
      mesh: 'bg-[radial-gradient(50%_40%_at_30%_30%,color-mix(in_oklch,var(--color-primary)_35%,transparent)_0%,transparent_60%),radial-gradient(40%_30%_at_80%_60%,color-mix(in_oklch,var(--color-info)_25%,transparent)_0%,transparent_60%),radial-gradient(40%_40%_at_70%_10%,color-mix(in_oklch,var(--color-warning)_18%,transparent)_0%,transparent_60%),linear-gradient(180deg,var(--color-hero)_0%,color-mix(in_oklch,var(--color-hero)_70%,black)_100%)]',
      flat: 'bg-[linear-gradient(180deg,var(--color-hero)_0%,color-mix(in_oklch,var(--color-hero)_70%,black)_100%)]',
    },
  },
  defaultVariants: {
    variant: 'glossy',
  },
});

const MAX_COUNT = 2;

export const ActiveUsers = () => {
  const { members } = useMembersInlineContext();
  const extraCount = members.length - MAX_COUNT;
  return (
    <div className="flex items-center -space-x-2">
      {members.slice(0, MAX_COUNT).map((member) => (
        <Avatar
          key={member._id}
          size="xl"
          className="outline-1 outline-primary border-2 border-transparent"
        >
          <Avatar.Image src={readImage(member.details?.avatar || '', 200)} />
          <Avatar.Fallback>
            {member.details?.fullName?.charAt(0) || ''}
          </Avatar.Fallback>
        </Avatar>
      ))}
      {extraCount > 0 && (
        <Avatar size="xl" className="border-2 border-transparent">
          <Avatar.Fallback>{'+' + extraCount}</Avatar.Fallback>
        </Avatar>
      )}
    </div>
  );
};

const ActiveUsersSmall = () => {
  const { members } = useMembersInlineContext();
  const extraCount = members.length - MAX_COUNT;
  return (
    <div className="flex items-center -space-x-2">
      {members.slice(0, MAX_COUNT).map((member) => (
        <Avatar
          key={member._id}
          size="lg"
          className="outline-1 outline-background border-2 border-transparent"
        >
          <Avatar.Image src={readImage(member.details?.avatar || '', 200)} />
          <Avatar.Fallback>
            {member.details?.fullName?.charAt(0) || 'S'}
          </Avatar.Fallback>
        </Avatar>
      ))}
      {extraCount > 0 && (
        <Avatar size="lg">
          <Avatar.Fallback>{'+' + extraCount}</Avatar.Fallback>
        </Avatar>
      )}
    </div>
  );
};

export const EMPreviewMain = () => {
  const appearance = useAtomValue(erxesMessengerSetupAppearanceAtom);
  const [activeTab, setActiveTab] = useAtom(emPreviewTabAtom);
  const step = useAtomValue(erxesMessengerSetupStepAtom);

  useEffect(() => {
    if (step === 3 || step === 4) {
      setActiveTab('chat');
    } else {
      setActiveTab('default');
    }
  }, [step, setActiveTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'messages':
        return <EMPreviewMessagesIntro />;
      case 'chat':
        return <EMPreviewMessages />;
      case 'ticket':
        return <EMPreviewTickets />;
      case 'faq':
        return <EMPreviewFaq />;
      case 'web-call':
        return <EMPreviewWebsiteApp />;
      default:
        return <EMPreviewIntro />;
    }
  };

  const hideNavigation = activeTab === 'chat' || activeTab === 'web-call';

  return (
    <>
      {renderContent()}
      {(activeTab === 'default' || activeTab === 'chat') && (
        <EMPreviewChatInput />
      )}
      {!hideNavigation && (
        <EMPreviewNavigation variant={appearance?.navigationVariant} />
      )}
    </>
  );
};

export const EMPreviewIntro = () => {
  const { t } = useTranslation('frontline');
  const greeting = useAtomValue(erxesMessengerSetupGreetingAtom);
  const hours = useAtomValue(erxesMessengerSetupHoursAtom);
  const config = useAtomValue(erxesMessengerSetupConfigAtom);
  const appearance = useAtomValue(erxesMessengerSetupAppearanceAtom);
  const settings = useAtomValue(erxesMessengerSetupSettingsAtom);
  const intro = useAtomValue(erxesMessengerSetupIntroAtom);
  const setActiveTab = useSetAtom(emPreviewTabAtom);
  const setWebsiteAppUrl = useSetAtom(emPreviewWebsiteAppUrl);
  const setWebsiteAppHeaderTitle = useSetAtom(emPreviewWebsiteAppHeaderTitle);

  const formatScheduleDays = (
    obj: Partial<
      Record<
        Weekday | ScheduleDay,
        { work?: boolean; from?: string; to?: string }
      >
    >,
  ): string => {
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
      set.every((d) => activeDays.includes(d)) &&
      activeDays.length === set.length;

    if (hasAll(allDays)) return t('everyday');
    if (hasAll(allWeekdays)) return t('monday-friday');
    if (hasAll(weekend)) return t('weekends');

    return activeDays
      .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
      .join(', ');
  };

  const formatTime = (raw: string): string =>
    format(parse(raw, 'HH:mm:ss', new Date()), 'h:mm aa').toLowerCase();

  const getFirstActiveTime = (
    obj: Partial<
      Record<
        Weekday | ScheduleDay,
        { work?: boolean; from?: string; to?: string }
      >
    >,
  ): string => {
    const WEEKDAY_VALUES = new Set<string>(Object.values(Weekday));
    const entry = Object.entries(obj).find(
      ([key, value]) =>
        WEEKDAY_VALUES.has(key) && value?.work && value.from && value.to,
    );
    if (!entry) return '9:00 am – 5:00 pm';
    return `${formatTime(entry[1].from!)} – ${formatTime(entry[1].to!)}`;
  };

  const availabilityText =
    hours?.availabilityMethod === 'manual'
      ? '9:00 am – 5:00 pm'
      : getFirstActiveTime(hours?.onlineHours || {});

  const scheduleDays = formatScheduleDays(hours?.onlineHours || {});

  const hasLinks = greeting?.links?.some(Boolean);

  const heroStyle = appearance?.backgroundColor
    ? ({ '--color-hero': appearance.backgroundColor } as React.CSSProperties)
    : undefined;

  return (
    <div className="flex-1 overflow-y-auto min-h-0 bg-muted hide-scroll">
      {/* Hero header — matches HeaderHero "default" tab */}
      <div
        className={cn(
          heroBackgroundVariants({ variant: appearance?.heroStyleVariant }),
          'min-h-40 px-5 pt-[18px] pb-12 relative flex-auto',
        )}
        style={heroStyle}
      >
        <div className="flex items-center justify-between">
          <div className="bg-background size-8 rounded flex items-center justify-center p-1">
            {appearance?.logo ? (
              <img
                alt="logo"
                src={readImage(appearance.logo)}
                className="object-center object-scale-down"
              />
            ) : (
              <ErxesLogoIcon className="size-5" />
            )}
          </div>
          <MembersInline.Provider memberIds={greeting?.supporterIds || []}>
            <ActiveUsers />
          </MembersInline.Provider>
        </div>
        <div className="mt-11 flex flex-col gap-0.5">
          <h1 className="text-primary-foreground text-[30px] leading-none">
            {greeting?.title ?? t('hello-there')}
          </h1>
          <h2 className="text-primary-foreground/60 text-2xl leading-none font-light">
            {greeting?.message ?? t('how-can-we-help')}
          </h2>
          {intro?.welcome && (
            <div className="mt-3 rounded-2xl py-1.75 ps-2.5 pe-3 flex-none w-auto bg-success/16 flex items-center gap-1.5 border border-success/30">
              <div className="rounded-full bg-success size-1.5 flex-none" />
              <span className="flex-1 overflow-x-hidden">
                <span className="flex tracking-tight text-xs font-medium leading-snug text-primary-foreground text-justify">
                  {intro?.welcome ?? t('got-any-problems')}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content — overlaps hero with -mt-14 */}
      <div className="relative z-20 px-2 pb-2">
        {/* Ask a question card */}
        <div
          className="shrink-0 relative px-2 -mt-8 z-30 cursor-pointer"
          role="button"
          onClick={() => {
            setActiveTab('messages');
          }}
        >
          <div className="bg-background rounded-2xl shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-foreground">
                {t('ask-a-question')}
              </div>
              <div className="text-muted-foreground text-xs font-normal mt-0.5">
                {t('ai-agent-and-team-can-help')}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MembersInline.Provider memberIds={greeting?.supporterIds || []}>
                <ActiveUsersSmall />
              </MembersInline.Provider>
              <IconArrowRight size={16} className="text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="flex flex-col gap-2 pt-2 px-2">
          {/* Greeting card — matches HeaderIntro */}
          <div className="flex flex-col gap-4 w-full p-4 rounded-2xl shadow-xs bg-background">
            <div className="gap-2 flex flex-col">
              <div className="font-semibold text-foreground text-base">
                {t('need-help')}
              </div>
              <div className="text-muted-foreground font-normal text-xs">
                {t('were-available-between')}{' '}
                <b className="text-foreground">{availabilityText}</b>
                {hours?.availabilityMethod !== 'manual' && scheduleDays && (
                  <>, {scheduleDays}</>
                )}
                {hours?.displayOperatorTimezone && (
                  <b className="text-foreground">
                    {' '}
                    ({formatTimeZoneLabel(hours?.timezone as string) || t('utc')})
                  </b>
                )}
              </div>
              {hasLinks && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground font-medium text-xs">
                    {t('contact-us-for-questions')}
                  </span>
                  <div className="flex gap-1">
                    {greeting?.links?.map(
                      (link) =>
                        !!link && (
                          <Tooltip.Provider key={link.url}>
                            <Tooltip>
                              <Tooltip.Trigger>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <EMGreetingAvatar url={link.url} />
                                </a>
                              </Tooltip.Trigger>
                              <Tooltip.Content className="flex items-center gap-2">
                                <EMGreetingAvatar url={link.url} />
                                {link.url}
                              </Tooltip.Content>
                            </Tooltip>
                          </Tooltip.Provider>
                        ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tickets card */}
          {config?.ticketConfigId && (
            <div
              className="w-full bg-background rounded-2xl shadow-xs p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-all duration-200 hover:shadow-sm"
              role="button"
              onClick={() => setActiveTab('ticket')}
            >
              <div className="bg-muted rounded-full p-2.5 flex-none">
                <IconSend size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  tickets
                </div>
                <div className="text-sm font-normal text-accent-foreground truncate">
                  Issue a ticket
                </div>
              </div>
              <IconArrowRight
                size={16}
                className="text-muted-foreground flex-none"
              />
            </div>
          )}

          {/* FAQ card */}
          {config?.knowledgeBaseTopicId && (
            <div
              className="w-full bg-background rounded-2xl shadow-xs p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-all duration-200 hover:shadow-sm"
              role="button"
              onClick={() => setActiveTab('faq')}
            >
              <div className="bg-muted rounded-full p-2.5 flex-none">
                <IconHelp size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  {t('popular-article')}
                </div>
                <div className="text-sm font-normal text-accent-foreground truncate">
                  {t('browse-our-help-center')}
                </div>
              </div>
              <IconArrowRight
                size={16}
                className="text-muted-foreground flex-none"
              />
            </div>
          )}
          {settings?.websiteApps && settings?.websiteApps?.length > 0 && (
            <div className="flex flex-col gap-4 my-2">
              <span className="font-mono uppercase ps-2 text-muted-foreground font-semibold text-sm">
                Web apps
              </span>
              <div className="flex flex-col gap-2">
                {settings?.websiteApps?.map((webApp, index) => (
                  <div
                    className="w-full bg-background rounded-2xl shadow-xs p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-all duration-300 hover:shadow-sm"
                    role="button"
                    tabIndex={index}
                    key={webApp?._id}
                    onClick={() => {
                      setActiveTab('web-call');
                      setWebsiteAppUrl(webApp?.credentials?.url);
                      setWebsiteAppHeaderTitle(
                        webApp?.credentials?.description,
                      );
                    }}
                  >
                    <div className="bg-muted rounded-full p-2.5 flex-none">
                      <IconBookmark size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground uppercase tracking-wide">
                        {webApp?.credentials?.buttonText}
                      </div>
                      <div className="text-sm font-normal text-accent-foreground truncate">
                        {webApp?.credentials?.description}
                      </div>
                    </div>

                    <IconArrowRight
                      size={16}
                      className="text-muted-foreground flex-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NAV_ITEMS = [
  { label: 'home', Icon: IconHome, value: 'default' },
  { label: 'messages', Icon: IconMessageCircle, value: 'messages' },
  { label: 'help', Icon: IconHelpCircle, value: 'faq' },
  { label: 'tickets', Icon: IconTicket, value: 'ticket' },
] as const;

export const EMPreviewNavigation = ({
  variant,
}: {
  variant?: 'pill' | 'fluid';
}) => {
  const { t } = useTranslation('frontline');
  const [activeTab, setActiveTab] = useAtom(emPreviewTabAtom);

  if (!variant || variant === 'fluid') {
    return (
      <nav className="pt-2 px-1 pb-2.5 flex-none bg-muted border-t border-border flex">
        <ul className="inline-flex items-center justify-center w-full mx-auto">
          {NAV_ITEMS.map((item) => {
            const { Icon } = item;
            const isActive = activeTab === item.value;
            return (
              <li className="flex-1" key={item.value}>
                <button
                  onClick={() => setActiveTab(item.value)}
                  className={cn(
                    'w-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <Icon size={22} />
                  <span
                    className={cn(
                      'text-[11px] font-normal',
                      isActive
                        ? 'text-primary dark:text-primary-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {t(item.label)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="py-2 px-3 flex items-center justify-center bg-muted flex-none">
      <ul className="inline-flex flex-none items-center w-auto bg-accent backdrop-blur-xl shadow-xs rounded-full p-1.5">
        {NAV_ITEMS.map((item) => {
          const { Icon } = item;
          const isActive = activeTab === item.value;
          return (
            <li key={item.value}>
              <button
                onClick={() => setActiveTab(item.value)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-2 rounded-full cursor-pointer transition-colors',
                  isActive
                    ? 'bg-primary-foreground/60 dark:bg-primary-foreground/25 backdrop-blur-sm text-primary dark:text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-primary dark:hover:text-primary-foreground',
                )}
              >
                <Icon size={20} />
                <span
                  className={cn(
                    'text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-200',
                    isActive
                      ? 'text-primary dark:text-primary-foreground max-w-20 opacity-100'
                      : 'max-w-0 opacity-0',
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export const EMPreviewAuthForm = () => {
  const { t } = useTranslation('frontline');
  const [value, setValue] = useState<string>('email');
  return (
    <InfoCard title={t('enter-email-or-phone')} className="w-full">
      <InfoCard.Content>
        <Tabs
          value={value}
          onValueChange={setValue}
          className="w-full space-y-3"
        >
          <Tabs.List className="w-full">
            <Tabs.Trigger value="email" className="flex-1">
              {t('email')}
            </Tabs.Trigger>
            <Tabs.Trigger value="phone" className="flex-1">
              {t('phone')}
            </Tabs.Trigger>
          </Tabs.List>
          <Input placeholder={t('first-name')} />
          <Input placeholder={t('last-name')} />
          <AnimatePresence mode="popLayout">
            {value === 'email' && (
              <>
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" type="email" placeholder={t('email')} />
              </>
            )}
          </AnimatePresence>
          <AnimatePresence mode="popLayout">
            {value === 'phone' && (
              <>
                <Label htmlFor="phone">{t('phone')}</Label>
                <PhoneInput defaultCountry="MN" className="bg-background" />
              </>
            )}
          </AnimatePresence>
        </Tabs>
        <Button type="submit" className="w-full self-end mt-auto">
          {t('save')}
        </Button>
      </InfoCard.Content>
    </InfoCard>
  );
};

export const EMPreviewMessagesIntro = () => {
  const settings = useAtomValue(erxesMessengerSetupSettingsAtom);
  const step = useAtomValue(erxesMessengerSetupStepAtom);
  const greeting = useAtomValue(erxesMessengerSetupGreetingAtom);
  const setActiveTab = useSetAtom(emPreviewTabAtom);
  const setHasChatContext = useSetAtom(emPreviewHasChatContext);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none pb-5.5 px-5 pt-4.5 bg-primary relative">
        <h1 className="text-primary-foreground/60 text-xs font-light">
          Messages
        </h1>
        <h2 className="text-primary-foreground text-2xl">Your conversations</h2>
      </div>
      <div className="flex-1 px-2 pb-2 flex flex-col bg-muted relative h-full overflow-y-hidden">
        {(settings?.requireAuth && step === 5 && (
          <div className="flex items-center gap-2 justify-start pt-4 px-2">
            <EMPreviewAuthForm />
          </div>
        )) || (
          <div className="flex relative flex-col h-full hide-scroll overflow-y-auto flex-1 font-medium text-sm">
            <div
              className="sticky top-0 bg-muted backdrop-blur-2xl z-30 flex-none p-4 pb-2"
              role="button"
              onClick={() => {
                setHasChatContext(false);
                setActiveTab('chat');
              }}
            >
              <div className="group rounded-2xl p-4 bg-background flex items-center gap-3 hover:shadow-sm hover:-translate-y-px shadow-xs transition-all ease-in-out cursor-pointer">
                <span className="size-9 bg-primary flex justify-center items-center rounded-full text-primary-foreground">
                  <IconPlus size={20} />
                </span>
                <span>
                  <div className="text-foreground text-base">
                    Start a new conversation
                  </div>
                  <div className="text-xs text-accent-foreground font-light">
                    Replies in ~ 4 minutes · 9pm-3am (GMT+8){' '}
                  </div>
                </span>
                <IconArrowRight
                  className="text-muted-foreground group-hover:translate-x-1 transition-all ease-in-out"
                  size={16}
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2.5 p-4 pt-2">
              <div
                className="group flex items-center gap-3 rounded-2xl cursor-pointer shadow-xs p-3 transition-all duration-200 bg-primary/8 hover:bg-primary/12"
                role="button"
                onClick={() => {
                  setHasChatContext(true);
                  setActiveTab('chat');
                }}
              >
                <span className="size-9 bg-primary flex-none flex justify-center items-center rounded-full text-primary-foreground">
                  <MembersInline.Provider
                    memberIds={
                      greeting?.supporterIds?.length
                        ? [greeting.supporterIds[0]]
                        : []
                    }
                  >
                    <MembersInline.Avatar size="xl" />
                  </MembersInline.Provider>
                </span>
                <span className="flex-1 flex flex-col gap-0.5">
                  <div className="text-primary text-xs font-bold flex items-center justify-between">
                    <MembersInline.Provider
                      memberIds={
                        greeting?.supporterIds?.length
                          ? [greeting.supporterIds[0]]
                          : []
                      }
                    >
                      <MembersInline.Title />
                    </MembersInline.Provider>
                    <span className="text-[10px]">just now</span>
                  </div>
                  <div className="text-sm text-primary font-bold">
                    2 new messages
                  </div>
                </span>
                <span className="rounded-full bg-primary text-[10px] text-primary-foreground flex-none size-5 flex items-center justify-center">
                  2
                </span>
              </div>
            </div>
            <div className="mx-auto text-xs text-accent-foreground font-light pt-2 pb-1">
              — end of your conversations —
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const EMPreviewTickets = () => {
  const { t } = useTranslation('frontline');
  const settings = useAtomValue(erxesMessengerSetupSettingsAtom);
  const config = useAtomValue(erxesMessengerSetupConfigAtom);
  const step = useAtomValue(erxesMessengerSetupStepAtom);

  if (!config?.ticketConfigId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-none pb-5.5 px-5 pt-4.5 bg-primary relative">
          <span className="text-primary-foreground/60 text-xs font-light">
            Tickets
          </span>
          <h1 className="text-primary-foreground text-2xl">Issue a ticket</h1>
        </div>

        <div className="flex-1 px-2 pb-2 flex flex-col bg-muted relative h-full overflow-y-hidden">
          <Empty>
            <Empty.Header>
              <Empty.Media>
                <IconTicket size={64} className="stroke-1 text-scroll" />
              </Empty.Media>
              <Empty.Title>{t('ticket-not-configured')}</Empty.Title>
              <Empty.Description>
                Select a Ticket config in your config to display articles here.
              </Empty.Description>
            </Empty.Header>
          </Empty>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex-none pb-5.5 px-5 pt-4.5 bg-primary relative">
        <span className="text-primary-foreground/60 text-xs font-light">
          Tickets
        </span>
        <h1 className="text-primary-foreground text-2xl">Issue a ticket</h1>
      </div>
      <div className="flex-1 px-2 pb-2 flex flex-col bg-muted relative h-full overflow-y-hidden">
        {(settings?.requireAuth && step === 5 && (
          <div className="flex items-center gap-2 justify-start pt-4 px-2">
            <EMPreviewAuthForm />
          </div>
        )) || (
          <div className="flex relative flex-col h-full hide-scroll overflow-y-auto flex-1 font-medium text-sm">
            <Empty>
              <Empty.Header>
                <Empty.Media>
                  <IconCircleMinus size={64} className="text-scroll stroke-1" />
                </Empty.Media>
                <Empty.Title>{t('no-tickets-found')}</Empty.Title>
                <Empty.Description>
                  Please create a ticket to get started.
                </Empty.Description>
              </Empty.Header>
              <Empty.Content>
                <Button>
                  <IconPlus />
                  Issue new ticket
                </Button>
              </Empty.Content>
            </Empty>
          </div>
        )}
      </div>
    </div>
  );
};

export const EMPreviewFaq = () => {
  const { t } = useTranslation('frontline');
  const config = useAtomValue(erxesMessengerSetupConfigAtom);
  const appearance = useAtomValue(erxesMessengerSetupAppearanceAtom);
  const heroStyle = appearance?.backgroundColor
    ? ({ '--color-hero': appearance.backgroundColor } as React.CSSProperties)
    : undefined;
  const { data, loading } = useQuery<{
    knowledgeBaseTopicDetail: IKnowledgeBaseTopic;
  }>(GET_KNOWLEDGE_BASE_TOPIC_DETAILS, {
    variables: {
      _id: config?.knowledgeBaseTopicId,
    },
    skip: !config?.knowledgeBaseTopicId,
  });

  const { knowledgeBaseTopicDetail } = data || {};
  const { parentCategories, title, color } = knowledgeBaseTopicDetail || {};

  if (loading) {
    return <Spinner containerClassName="py-32" />;
  }
  if (
    !config?.knowledgeBaseTopicId ||
    config?.knowledgeBaseTopicId === '' ||
    !knowledgeBaseTopicDetail
  ) {
    return (
      <div className="flex flex-col h-full">
        <div
          className={cn(
            heroBackgroundVariants({ variant: appearance?.heroStyleVariant }),
            'flex-none pb-5.5 px-5 pt-4.5 relative',
          )}
          style={heroStyle}
        >
          <span className="text-primary-foreground/60 text-xs font-light">
            {t('browse')}
          </span>
          <h1 className="text-primary-foreground text-2xl">{t('help-center')}</h1>
        </div>

        <div className="flex-1 px-2 pb-2 flex flex-col bg-muted relative h-full overflow-y-hidden">
          <Empty>
            <Empty.Header>
              <Empty.Media>
                <IconBook size={64} className="stroke-1 text-scroll" />
              </Empty.Media>
              <Empty.Title>{t('help-center-not-configured')}</Empty.Title>
              <Empty.Description>
                {t('select-knowledge-base-topic-description')}
              </Empty.Description>
            </Empty.Header>
          </Empty>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto hide-scroll min-h-0 bg-muted">
      <div
        className={cn(
          heroBackgroundVariants({ variant: appearance?.heroStyleVariant }),
          'min-h-40 pb-28 flex-auto px-5 pt-4.5 relative',
        )}
        style={heroStyle}
      >
        <h1 className="text-primary-foreground text-2xl">{t('help-center')}</h1>
        <span className="text-primary-foreground/60 text-xs font-light">
          {t('browse')} {title}
        </span>
        <label
          htmlFor="search-faq"
          className="rounded-xl bg-background flex items-center mt-4 py-2.5 px-3"
        >
          <IconSearch size={18} className="flex-none" />
          <input
            id="search-faq"
            placeholder={t('search-for-help')}
            className="bg-transparent p-0 m-0 text-xs flex-1 leading-none focus-visible:outline-none focus-visible:border-none focus-visible:ring-0 ps-4"
          />
        </label>
      </div>

      <div className="bg-muted relative z-20 px-2 pb-2 -mt-14 flex-1">
        <div className="px-4 flex flex-col gap-2.5 relative -mt-14 z-30">
          {parentCategories &&
            parentCategories.map((parent, index) => (
              <div
                key={parent._id}
                className={cn(
                  { '-mt-8': index === 0 },
                  'group rounded-2xl shadow-xs p-3.5 bg-background flex items-center gap-3 transition-all duration-300 ease-in-out hover:-translate-y-0.5 cursor-pointer hover:shadow-sm',
                )}
                role="button"
                tabIndex={0}
              >
                <span
                  className="shrink-0 p-2 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor:
                      `color-mix(in srgb, ${color} 60%, transparent)` ||
                      'color-mix(in oklch, var(--primary) 60%, transparent)',
                  }}
                >
                  <IconComponent
                    className="text-primary-foreground"
                    name={parent.icon || 'help-circle'}
                    size={20}
                  />
                </span>
                <span className="flex-1 overflow-hidden min-w-0">
                  <h1 className="text-base font-semibold text-foreground">
                    {parent.title}
                  </h1>
                  <p className="text-xs font-light mt-0.5 line-clamp-2 whitespace-break-spaces truncate text-accent-foreground">
                    {parent.description}
                  </p>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {parent.numOfArticles === 1
                      ? '1 article'
                      : `${parent.numOfArticles} articles`}
                    {parent.childrens?.length
                      ? ` · ${parent.childrens.length} sections`
                      : ''}
                  </span>
                </span>
                <span className="shrink-0">
                  <IconArrowRight
                    className="text-muted-foreground group-hover:translate-x-0.5 transition-all ease-in-out delay-300"
                    size={18}
                  />
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
