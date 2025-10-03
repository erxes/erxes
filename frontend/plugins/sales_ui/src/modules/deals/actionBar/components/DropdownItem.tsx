import { DropdownMenu } from 'erxes-ui';
import { FilterItem } from '../types/actionBarTypes';

type Props = {
  item: FilterItem;
  itemIndex: number;
};

const DropdownItem = ({ item, itemIndex }: Props) => {
  const Icon = item.icon;

  return (
    <DropdownMenu.Item key={itemIndex}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {item.value}
      </div>
      <DropdownMenu.Shortcut>⌘P</DropdownMenu.Shortcut>
    </DropdownMenu.Item>
  );
};

export default DropdownItem;
