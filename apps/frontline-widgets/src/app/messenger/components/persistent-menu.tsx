import { IconMenu } from "@tabler/icons-react"
import { Button, DropdownMenu } from "erxes-ui"
import { useMessenger } from "../hooks/useMessenger"
import { useAtomValue } from "jotai";
import { connectionAtom } from "../states";
import { Link } from "react-router-dom";
import { IPersistentMenu } from "../types";

export const PersistentMenu = () => {
  const { activeTab } = useMessenger();
  const connection = useAtomValue(connectionAtom);
  const { widgetsMessengerConnect } = connection || {};
  const { persistentMenus } = widgetsMessengerConnect?.messengerData || {};
  const hasPersistentMenus = persistentMenus && persistentMenus?.length > 0 || false;
  if (activeTab !== 'chat' || !hasPersistentMenus) return null;
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger disabled={!hasPersistentMenus}>
        <Button size={'icon'} asChild className="size-8 p-2">
          <IconMenu />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" sideOffset={12}>
        {
          persistentMenus?.map((menu, index) => (
            <Item key={index} type={menu.type} text={menu.text} />
          ))
        }
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

export const Item = ({ type, text }: IPersistentMenu) => {
  switch (type) {
    case 'button':
      return (
        <DropdownMenu.Item key={text} className="hover:bg-primary/30!">
          <span className="text-sm">
            {text}
          </span>
        </DropdownMenu.Item>)
    case 'link':
      return (
        <DropdownMenu.Item key={text} className="hover:bg-primary/30!">
          <Link to={'#'} className="text-sm">
            {text}
          </Link>
        </DropdownMenu.Item>)
    default:
      return (
        <DropdownMenu.Item key={text} className="hover:bg-primary/30!">
          <span>
            {text}
          </span>
        </DropdownMenu.Item>
      )
  }
}