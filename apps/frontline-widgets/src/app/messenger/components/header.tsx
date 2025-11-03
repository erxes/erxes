import { useAtom } from 'jotai';
import { connectionAtom } from '../states';
import { WelcomeMessage } from '../constants';
import { formatTimeZoneLabel } from 'erxes-ui';
import { HeaderTabList } from './header-tab-list';
import { IconChevronLeft } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useHeader } from '../hooks/useHeader';
import { HeaderItemsList } from './header-item-list';

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
    <div className="flex flex-col flex-shrink-0 grow-0 gap-4 p-4 bg-background border-b border-accent">
      {render()}
    </div>
  );
};

export const HeaderIntro = () => {
  const [connection] = useAtom(connectionAtom);
  const { messengerData } = connection.widgetsMessengerConnect || {};
  const { messages, onlineHours, showTimezone, timezone } = messengerData || {};

  return (
    <div className="flex flex-col gap-4">
      <div className="gap-2 flex flex-col">
        <div className="font-semibold text-accent-foreground text-base">
          {messages?.greetings?.title || WelcomeMessage.TITLE}
        </div>
        <div className="text-muted-foreground font-medium text-sm">
          {messages?.greetings?.message || WelcomeMessage.MESSAGE}{' '}
          {messages?.thank || ''}
          {'. '}
          {onlineHours?.map(
            (hour: { day: string; from: string; to: string }) => (
              <span key={hour.day}>
                ({hour.from} болон {hour.to} хооронд
                {showTimezone && ` (${formatTimeZoneLabel(timezone || '')})`})
              </span>
            ),
          )}
        </div>
      </div>
      <HeaderItemsList />
    </div>
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
          <IconChevronLeft size={16} />
        </Button>
        <div className="text-base font-semibold">{getCurrentTitle()}</div>
      </div>
      <HeaderTabList />
    </div>
  );
};
