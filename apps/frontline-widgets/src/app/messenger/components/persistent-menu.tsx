import { IconMenu } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useMessenger } from '../hooks/useMessenger';
import { useAtomValue } from 'jotai';
import { connectionAtom } from '../states';
import { Link } from 'react-router-dom';
import { IPersistentMenu } from '../types';
import { useInsertMessage } from '../hooks/useInsertMessage';
import { getLocalStorageItem } from '@libs/utils';

export const PersistentMenu = () => {
  const { activeTab } = useMessenger();
  const connection = useAtomValue(connectionAtom);
  const { widgetsMessengerConnect } = connection || {};
  const { persistentMenus } = widgetsMessengerConnect?.messengerData || {};
  const hasPersistentMenus =
    (persistentMenus && persistentMenus?.length > 0) || false;

  if (activeTab !== 'chat' || !hasPersistentMenus) return null;
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger disabled={!hasPersistentMenus}>
        <Button size={'icon'} asChild className="size-8 p-2 rounded-full">
          <IconMenu />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-48" sideOffset={12}>
        {persistentMenus?.map((menu, index) => (
          <Item
            key={index}
            type={menu.type}
            text={menu.text}
            link={menu.link}
            contentType={menu.contentType}
          />
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const Item = ({ type, text, link, contentType }: IPersistentMenu) => {
  switch (type) {
    case 'button':
      return <ButtonItem text={text} contentType={contentType} />;
    case 'link':
      return <LinkItem text={text} link={link} />;
    default:
      return <ButtonItem text={text} contentType={contentType} />;
  }
};

export const ButtonItem = ({
  text,
  contentType = 'text',
}: {
  text: string;
  contentType: string;
}) => {
  const { insertMessage } = useInsertMessage();
  const connection = useAtomValue(connectionAtom);
  const { customerId } = connection.widgetsMessengerConnect;
  const __customerId = getLocalStorageItem('customerId');

  const handleClick = () => {
    insertMessage({
      variables: {
        contentType,
        message: text,
        customerId: customerId || __customerId || undefined,
      },
    });
  };
  return (
    <DropdownMenu.Item
      key={text}
      className="hover:bg-primary/30! text-foreground"
      onSelect={handleClick}
    >
      <span className="text-sm">{text}</span>
    </DropdownMenu.Item>
  );
};

export const LinkItem = ({ text, link }: { text: string; link?: string }) => {
  return (
    <DropdownMenu.Item key={text} className="hover:bg-primary/30!">
      <Link
        to={link || '#'}
        target={link ? '_blank' : undefined}
        rel={link ? 'noopener noreferrer' : undefined}
        className="text-sm text-foreground"
      >
        {text}
      </Link>
    </DropdownMenu.Item>
  );
};
