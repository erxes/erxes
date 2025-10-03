import { IconForms } from '@tabler/icons-react';
import { IMessage } from '../../types/Conversation';
import { IFormWidgetItem } from '../../types/FormWidget';
import { Input, Label, RelativeDateDisplay, Textarea, cn } from 'erxes-ui';

export const ConversationFormDisplay = ({
  content,
  formWidgetData,
  createdAt,
}: IMessage) => {
  return (
    <div className="flex flex-col gap-2 relative">
      <div className="flex flex-col bg-muted rounded-t-lg rounded-b-2xl p-2">
        <div className="px-3 pb-2 flex items-center gap-2 text-primary">
          <IconForms size={24} />
          <span className="text-sm font-semibold">{content}</span>
        </div>
        <div className="bg-background p-4 rounded-lg grid grid-cols-6 gap-6">
          {formWidgetData?.map((item: IFormWidgetItem) => (
            <div
              key={item._id}
              className={cn(
                'col-span-6 flex flex-col gap-2',
                item.column === 6 && 'col-span-6',
                item.column === 5 && 'col-span-5',
                item.column === 4 && 'col-span-4',
                item.column === 3 && 'col-span-3',
                item.column === 2 && 'col-span-2',
                item.column === 1 && 'col-span-1',
              )}
            >
              <Label>{item.text}</Label>
              {item.value.length > 60 ? (
                <Textarea value={item.value} />
              ) : (
                <Input value={item.value} />
              )}
            </div>
          ))}
        </div>
      </div>
      <span className="absolute -bottom-5 font-medium right-2 text-xs text-accent-foreground">
        <RelativeDateDisplay value={createdAt} />
      </span>
    </div>
  );
};
