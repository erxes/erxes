import { Icon } from '@tabler/icons-react';

export const RecordTableInlineHead = (props: {
  icon?: Icon;
  label: string;
}) => {
  return (
    <div className="flex items-center gap-1">
      {props.icon && <props.icon className="size-4" />}
      {props.label}
    </div>
  );
};
