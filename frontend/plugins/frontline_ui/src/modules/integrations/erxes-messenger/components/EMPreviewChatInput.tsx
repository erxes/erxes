import {
  IconArrowRight,
  IconMenu,
  IconMoodSmile,
  IconPaperclip,
} from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  erxesMessengerSetupConfigAtom,
  erxesMessengerSetupIntroAtom,
} from '../states/erxesMessengerSetupStates';
import { Link } from 'react-router-dom';
import { emPreviewTabAtom } from '../states/emPreviewStates';

export const EMPreviewChatInput = () => {
  const { t } = useTranslation('frontline');
  const intro = useAtomValue(erxesMessengerSetupIntroAtom);
  const activetab = useAtomValue(emPreviewTabAtom);
  const isInChat = activetab === 'chat';
  return (
    <div className="py-2 px-4 border-t border-border">
      <label
        className="flex items-center gap-1 rounded-2xl shadow-xs p-1.5 ps-2.5 bg-background"
        htmlFor="em-preview-chat-input"
      >
        {/* Attachment uploader */}
        {isInChat && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-5 hover:bg-transparent shrink-0 group"
          >
            <IconPaperclip className="size-4 text-muted-foreground shrink-0 group-hover:text-primary dark:group-hover:text-primary-foreground transition-all" />
          </Button>
        )}
        <input
          placeholder={!isInChat ? intro?.welcome : t('reply')}
          className="border-none placeholder:truncate py-1.5 h-auto px-1 text-xs bg-transparent text-foreground shadow-none focus-visible:outline-none! focus-visible:ring-0! focus-visible:border-0! placeholder:text-muted-foreground placeholder:font-medium placeholder:text-sm flex-1"
          id="em-preview-chat-input"
        />
        {/* emoji picker */}
        {isInChat && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-5 hover:bg-transparent group shrink-0"
          >
            <IconMoodSmile className="size-5 text-muted-foreground shrink-0 group-hover:text-primary dark:group-hover:text-primary-foreground transition-all" />
          </Button>
        )}
        <Button
          size={'icon'}
          className="shrink-0 size-8 bg-primary rounded-full"
        >
          <IconArrowRight />
        </Button>
        {/* persistent menu */}
        {isInChat && <EMPersistentMenu />}
      </label>
    </div>
  );
};

export const EMPersistentMenu = () => {
  const config = useAtomValue(erxesMessengerSetupConfigAtom);
  if (!config?.botSetup?.persistentMenu?.length) return null;
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          size={'icon'}
          className="shrink-0 size-8 bg-primary rounded-full"
        >
          <IconMenu />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" side="top" sideOffset={12}>
        {config?.botSetup?.persistentMenu?.map((menu) => {
          if (menu.type === 'link') {
            return (
              <DropdownMenu.Item key={menu.text}>
                <Link to={menu.link || '#'} target="_blank">
                  <span className="text-sm">{menu.text}</span>
                </Link>
              </DropdownMenu.Item>
            );
          }
          return (
            <DropdownMenu.Item key={menu.text}>
              <span className="text-sm">{menu.text}</span>
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
