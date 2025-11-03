import { IconClipboard } from '@tabler/icons-react';
import { ScrollArea } from 'erxes-ui';

export const ProjectWidget = ({
  contentId,
  contentType,
}: {
  contentId: string;
  contentType: string;
}) => {
  return (
    <ScrollArea className="h-full flex-auto">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2 items-center justify-center">
          <IconClipboard className="size-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            No projects related
          </span>
        </div>
      </div>
    </ScrollArea>
  );
};
