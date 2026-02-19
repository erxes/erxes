import { useAtom } from 'jotai';
import { connectionAtom } from '../states';
import { WelcomeMessage } from '../constants';
import { HeaderTabList } from './header-tab-list';
import { IconChevronLeft } from '@tabler/icons-react';
import { Button, Tooltip } from 'erxes-ui';
import { useHeader } from '../hooks/useHeader';
import { HeaderItemsList } from './header-item-list';
import { formatOnlineHours } from '@libs/formatOnlineHours';
import { LinkFavicon } from './link-favicon';

export const Header = () => {
  const { renderHeaderContent } = useHeader();

  const render = () => {
    const content = renderHeaderContent();
    switch (content) {
      case 'hero-intro':
        return <HeaderIntro />;
      case 'header-tabs':
        return <HeaderTabs />;
      default:
        return <HeaderTabs />;
    }
  };

  return (
    <div className="flex flex-col shrink-0 grow-0 gap-4 p-4 bg-background border-b border-accent">
      {render()}
    </div>
  );
};

export const HeaderIntro = () => {
  const [connection] = useAtom(connectionAtom);
  const { messengerData } = connection.widgetsMessengerConnect || {};
  const { messages, onlineHours, showTimezone, timezone, links } = messengerData || {};

  return (
    <div className="flex flex-col gap-4">
      <div className="gap-2 flex flex-col">
        <div className="font-semibold text-accent-foreground text-base">
          {messages?.greetings?.title || WelcomeMessage.TITLE}
        </div>
        <div className="text-muted-foreground font-medium text-sm">
          {messages?.greetings?.message || WelcomeMessage.MESSAGE}{'. '}
          {onlineHours
            ? formatOnlineHours({ onlineHours, showTimezone, timezone })
            : WelcomeMessage.AVAILABILITY_MESSAGE}{' '}
        </div>
        <div className='flex flex-col gap-1'>
          {links && <span className="text-muted-foreground font-medium text-xs">Contact us for any questions or concerns.</span>}
          <div className='flex gap-1'>
            {
              Object.entries(links || {})?.map(([key, value]) => (
                <Tooltip.Provider>
                  <Tooltip key={key}>
                    <Tooltip.Trigger>
                      <a href={value as string} target="_blank" rel="noopener noreferrer">
                        <LinkFavicon url={value as string} />
                      </a>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      {key}
                    </Tooltip.Content>
                  </Tooltip>
                </Tooltip.Provider>
              ))
            }
          </div>
        </div>
      </div>
      <HeaderItemsList />
    </div >
  );
};

export const HeaderTabs = () => {
  const { goBack, getCurrentTitle } = useHeader();
  return (
    <div
      role="heading"
      aria-level={1}
      className="flex items-center justify-between"
    >
      <div className="flex items-center">
        <Button
          type="button"
          role="button"
          size="icon"
          variant="ghost"
          tabIndex={0}
          aria-label="Back"
          className="flex items-center gap-2 hover:bg-transparent size-8 text-accent-foreground"
          onClick={goBack}
        >
          <IconChevronLeft className="w-4 h-4 shrink-0" />
        </Button>
        <div className="text-base font-semibold">{getCurrentTitle()}</div>
      </div>
      <HeaderTabList />
    </div>
  );
};
