import {
  IconArrowLeft,
  IconArrowsDiagonal2,
  IconArrowsDiagonalMinimize,
  IconPhone,
  IconSend,
  IconVideo,
} from '@tabler/icons-react';
import { Avatar, Button, Tooltip } from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  erxesMessengerSetupConfigAtom,
  erxesMessengerSetupGreetingAtom,
  erxesMessengerSetupHoursAtom,
  erxesMessengerSetupIntroAtom,
  erxesMessengerSetupSettingsAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { MembersInline } from 'ui-modules';
import { EMPreviewChatInput } from './EMPreviewChatInput';
import {
  emPreviewChatIsExpanded,
  emPreviewHasChatContext,
  emPreviewTabAtom,
} from '../states/emPreviewStates';

export const EMPreviewMessages = () => {
  const greeting = useAtomValue(erxesMessengerSetupGreetingAtom);
  const settings = useAtomValue(erxesMessengerSetupSettingsAtom);
  const config = useAtomValue(erxesMessengerSetupConfigAtom);
  const intro = useAtomValue(erxesMessengerSetupIntroAtom);
  const hours = useAtomValue(erxesMessengerSetupHoursAtom);
  const [isChatExpanded, setIsChatExpanded] = useAtom(emPreviewChatIsExpanded);
  const hasChatContext = useAtomValue(emPreviewHasChatContext);
  const setActiveTab = useSetAtom(emPreviewTabAtom);

  const subtitle = `usually replies in a few ${
    hours?.responseRate || 'minutes'
  }`;

  return (
    <>
      {/* Header — matches ConversationDetails header */}
      <div className="flex items-center gap-3 px-3 py-2.5 bg-primary shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="text-primary-foreground rounded-2xl hover:bg-primary-foreground/10 size-8 shrink-0 [&>svg]:size-4"
          onClick={() => setActiveTab('messages')}
        >
          <IconArrowLeft />
        </Button>
        <Avatar className="size-9 shrink-0">
          <Avatar.Fallback className="bg-primary-foreground/20 text-primary-foreground font-semibold text-sm">
            S
          </Avatar.Fallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-primary-foreground font-semibold text-sm truncate">
            Support
          </div>
          <div className="text-primary-foreground/60 text-xs truncate">
            {subtitle}
          </div>
        </div>
        <Tooltip.Provider>
          <div className="flex items-center gap-1">
            {settings?.showVideoCallRequest && (
              <>
                <Tooltip delayDuration={100}>
                  <Tooltip.Trigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-primary-foreground hover:bg-primary-foreground/10 size-8"
                    >
                      <IconPhone className="size-4" />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Audio call</Tooltip.Content>
                </Tooltip>
                <Tooltip delayDuration={100}>
                  <Tooltip.Trigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-primary-foreground hover:bg-primary-foreground/10 size-8"
                    >
                      <IconVideo className="size-4" />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Video call</Tooltip.Content>
                </Tooltip>
              </>
            )}
            <Tooltip delayDuration={100}>
              <Tooltip.Trigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/10 size-8"
                  onClick={() => setIsChatExpanded(!isChatExpanded)}
                >
                  {(isChatExpanded && (
                    <IconArrowsDiagonalMinimize size={16} />
                  )) || <IconArrowsDiagonal2 size={16} />}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Expand the messenger</Tooltip.Content>
            </Tooltip>
          </div>
        </Tooltip.Provider>
      </div>

      {/* Messages area */}
      <div className="p-4 flex-auto gap-2 flex flex-col justify-end overflow-y-auto">
        <div className="flex items-start self-end text-right gap-2 flex-row-reverse text-xs text-accent-foreground">
          {intro?.welcome}
        </div>
        <div className="flex items-end gap-2 max-w-2/3">
          <Avatar size={'xl'} className="mb-5">
            <Avatar.Fallback className="bg-background">S</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <Button
              variant="secondary"
              className="h-auto font-normal rounded-bl-lg rounded-t-2xl rounded-br-2xl flex flex-col justify-start items-start text-left gap-1 p-3 bg-background shadow-xs"
            >
              <p className="wrap-break-word">
                {config?.botSetup?.greetingMessage || 'Hi, any questions?'}
              </p>
            </Button>
            <div className="text-accent-foreground text-xs ps-1">
              few minutes ago
            </div>
          </div>
        </div>
        {hasChatContext && (
          <>
            <div className="flex items-end gap-2 flex-row-reverse">
              <div className="flex flex-col gap-1">
                <Button
                  variant="secondary"
                  className="h-auto font-normal flex flex-col justify-start hover:bg-primary/80 items-start rounded-bl-2xl rounded-br-lg rounded-t-2xl text-left gap-1 p-3 bg-primary text-primary-foreground"
                >
                  <p>We need your help!</p>
                </Button>
                <div className="text-accent-foreground text-xs flex justify-end items-end pe-1">
                  few minutes ago
                </div>
              </div>
            </div>
            <div className="flex items-end gap-2 max-w-2/3">
              <MembersInline.Provider
                memberIds={
                  greeting?.supporterIds?.length
                    ? [greeting.supporterIds[0]]
                    : []
                }
              >
                <MembersInline.Avatar size="xl" className="mb-5" />
              </MembersInline.Provider>
              <div className="flex flex-col gap-1">
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="secondary"
                    className="h-auto font-normal rounded-b-sm rounded-t-2xl flex flex-col justify-start items-start text-left gap-1 p-3 bg-background shadow-xs"
                  >
                    <p className="wrap-break-word text-wrap">
                      {intro?.away ||
                        "We've received your message and will contact you shortly."}
                    </p>
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-auto font-normal rounded-bl-lg rounded-t-sm rounded-br-2xl flex flex-col justify-start items-start text-left gap-1 p-3 bg-background shadow-xs"
                  >
                    <p className="wrap-break-word text-wrap">
                      {intro?.thank ||
                        'Thank you for contacting us. We will get back to you as soon as possible.'}
                    </p>
                  </Button>
                </div>
                <div className="text-accent-foreground text-xs ps-1">
                  just now
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
