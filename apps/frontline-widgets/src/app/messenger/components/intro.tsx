import { Avatar, readImage, Skeleton, Spinner } from 'erxes-ui';
import { useGetMessengerSupporters } from '../hooks/useGetMessengerSupporters';
import { ConversationMessage } from './conversation';
import { useConversations } from '../hooks/useConversations';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCustomerData } from '../hooks/useCustomerData';
import {
  connectionAtom,
  hasTicketConfigAtom,
  webAppCredentialsUrlAtom,
} from '../states';
import { NotifyCustomerForm } from './notify-customer-form';
import { HeaderIntro } from './header';
import { AvatarGroup } from './avatar-group';
import { useMessenger } from '../hooks/useMessenger';
import { ISupporter } from '../types';
import {
  IconArrowRight,
  IconBookmark,
  IconHelp,
  IconPlus,
  IconSend,
} from '@tabler/icons-react';
import { WelcomeMessage } from '../constants';
import { formatOnlineHoursShort } from '@libs/formatOnlineHours';

export const Intro = () => {
  const { list: supporters, loading: loadingSupporters } =
    useGetMessengerSupporters();
  const [connection] = useAtom(connectionAtom);
  const setWebAppCredentialsUrl = useSetAtom(webAppCredentialsUrlAtom);
  const hasTicketConfig = useAtomValue(hasTicketConfigAtom);
  const { widgetsMessengerConnect } = connection || {};
  const { messengerData } = widgetsMessengerConnect || {};
  const { knowledgeBaseTopicId, websiteApps } = messengerData || {};
  const { switchToTab } = useMessenger();

  const handleSwitchWebCall = (url: string) => {
    setWebAppCredentialsUrl(url);
    switchToTab('web-call');
  };

  if (loadingSupporters) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex flex-col justify-center p-4 font-medium text-sm flex-1 min-h-0">
          <div className="flex items-center gap-3">
            <Skeleton className="flex-none size-8 bg-muted rounded-full" />
            <Skeleton className="flex-1 h-10 bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="shrink-0 relative px-2 -mt-8 z-20">
        <div
          className="bg-background rounded-2xl shadow-sm p-4 flex items-center justify-between cursor-pointer"
          onClick={() => switchToTab('chat')}
          role="button"
          tabIndex={0}
        >
          <div>
            <div className="font-semibold text-sm text-foreground">
              Ask a question
            </div>
            <div className="text-muted-foreground text-xs font-normal mt-0.5">
              AI Agent and team can help
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AvatarGroup max={2} size="lg" className="outline-background">
              {supporters?.map((supporter: ISupporter) => (
                <Avatar
                  key={supporter._id}
                  className="outline-1 outline-background"
                  size="lg"
                >
                  <Avatar.Image
                    src={readImage(supporter.details.avatar)}
                    alt={
                      supporter.details.fullName || supporter.details.firstName
                    }
                  />
                  <Avatar.Fallback>
                    {supporter.details.firstName?.charAt(0) || 'S'}
                  </Avatar.Fallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <IconArrowRight size={16} className="text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2 px-2">
        <HeaderIntro />

        {hasTicketConfig && (
          <div className="flex">
            <button
              onClick={() => switchToTab('ticket')}
              className="w-full bg-background rounded-2xl shadow-xs p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-all duration-300 hover:shadow-sm"
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
            </button>
          </div>
        )}

        {knowledgeBaseTopicId && (
          <div
            className="w-full bg-background rounded-2xl shadow-xs p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-all duration-300 hover:shadow-sm"
            role="button"
            tabIndex={0}
            onClick={() => switchToTab('faq')}
          >
            <div className="bg-muted rounded-full p-2.5 flex-none">
              <IconHelp size={20} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Popular Article
              </div>
              <div className="text-sm font-normal text-accent-foreground truncate">
                Browse our help center
              </div>
            </div>
            <IconArrowRight
              size={16}
              className="text-muted-foreground flex-none"
            />
          </div>
        )}

        {websiteApps && websiteApps?.length > 0 && (
          <div>
            <span className="font-mono uppercase ps-2 mb-4 text-muted-foreground font-semibold text-sm">
              Web apps
            </span>
            {websiteApps.map((app) => (
              <div
                key={app._id}
                className="w-full bg-background rounded-2xl shadow-xs p-4 flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-all duration-300 hover:shadow-sm"
                role="button"
                tabIndex={0}
                onClick={() => handleSwitchWebCall(app.credentials.url)}
              >
                <div className="bg-muted rounded-full p-2.5 flex-none">
                  <IconBookmark size={20} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    {app.credentials.buttonText}
                  </div>
                  <div className="text-sm font-normal text-accent-foreground truncate">
                    {app.credentials.description}
                  </div>
                </div>
                <IconArrowRight
                  size={16}
                  className="text-muted-foreground flex-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const Messages = () => {
  const { conversations, loading } = useConversations();
  const [connection] = useAtom(connectionAtom);
  const { messengerData } = connection.widgetsMessengerConnect || {};
  const { onlineHours, showTimezone, timezone, responseRate, requireAuth } =
    messengerData || {};

  const { hasEmailOrPhone } = useCustomerData();
  const { switchToTab } = useMessenger();

  if (loading) {
    return <Spinner containerClassName="py-32" />;
  }

  if (requireAuth === true && !hasEmailOrPhone) {
    return (
      <div className="flex flex-col flex-1 p-4 font-medium text-sm gap-1">
        <div className="flex flex-col justify-center font-medium text-sm">
          <NotifyCustomerForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex relative flex-col h-full hide-scroll overflow-y-auto flex-1 font-medium text-sm ">
      <div className="sticky top-0 bg-muted backdrop-blur-2xl z-30 flex-none p-4 pb-2">
        <button
          className="rounded-2xl w-full group p-4 bg-background flex text-left items-center gap-3 hover:shadow-sm hover:-translate-y-px shadow-xs transition-all ease-in-out cursor-pointer"
          onClick={() => switchToTab('chat')}
          tabIndex={0}
        >
          <span className="size-9 bg-primary flex justify-center items-center rounded-full">
            <IconPlus size={20} className="text-primary-foreground" />
          </span>
          <span className="flex-1">
            <div className="text-foreground text-[14px]">
              Start a new conversation
            </div>
            <div className="text-xs text-accent-foreground font-light">
              Replies in ~ 4 {responseRate} ·{' '}
              {onlineHours
                ? formatOnlineHoursShort({
                    onlineHours,
                    showTimezone,
                    timezone,
                  })
                : WelcomeMessage.AVAILABILITY_MESSAGE}{' '}
            </div>
          </span>
          <IconArrowRight
            size={16}
            className="text-muted-foreground group-hover:translate-x-1 transition-all ease-in-out"
          />
        </button>
      </div>
      <div className="flex-1 flex flex-col gap-2.5 p-4 pt-2">
        {conversations?.map((conversation) => (
          <ConversationMessage
            key={conversation._id}
            conversationId={conversation._id}
            conversation={conversation}
          />
        ))}
      </div>
      <div className="mx-auto text-xs text-accent-foreground font-light pt-2 pb-1">
        — end of your conversations —
      </div>
    </div>
  );
};
