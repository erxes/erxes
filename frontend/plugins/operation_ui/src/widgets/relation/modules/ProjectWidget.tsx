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
      <div className="flex flex-col gap-4 p-4"></div>
    </ScrollArea>
  );
};
