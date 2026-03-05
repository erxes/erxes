import { IconMenu, IconSend } from '@tabler/icons-react';
import { Button, DropdownMenu, Input } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import {
  erxesMessengerSetupConfigAtom,
  erxesMessengerSetupIntroAtom,
} from '../states/erxesMessengerSetupStates';
import { Link } from 'react-router-dom';

export const EMPreviewChatInput = () => {
  const intro = useAtomValue(erxesMessengerSetupIntroAtom);
  return (
    <div className="flex items-center gap-2 p-4">
      <Input
        placeholder={intro?.welcome || 'Send message'}
        className="flex-1 shadow-2xs"
      />
      <Button size={'icon'} className="shrink-0 size-8 bg-primary">
        <IconSend />
      </Button>
      <EMPersistentMenu />
    </div>
  );
};

export const EMPersistentMenu = () => {
  const config = useAtomValue(erxesMessengerSetupConfigAtom);
  if (!config?.botSetup?.persistentMenu) return null;
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button size={'icon'} className="shrink-0 size-8 bg-primary">
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
