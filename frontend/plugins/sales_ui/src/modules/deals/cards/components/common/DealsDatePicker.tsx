import { DatePicker } from 'erxes-ui';
import { Icon } from '@tabler/icons-react';

type Props = {
  date: Date;
  Icon: Icon;
  text: string;
};

export const DealsDatePicker = ({ date, Icon, text }: Props) => {
  return (
    <div className="text-xs flex items-center gap-1 text-gray-500">
      <Icon />
      <DatePicker
        value={date}
        onChange={(date) => console.log(date)}
        format="MMM DD"
        variant="ghost"
        className="p-0 h-3 text-xs"
        placeholder={text}
      />
    </div>
  );
};
