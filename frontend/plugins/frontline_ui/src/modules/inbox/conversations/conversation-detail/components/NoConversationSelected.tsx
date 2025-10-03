import { IconCircleMinus } from '@tabler/icons-react';

export const NoConversationSelected = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="size-28 bg-sidebar rounded-2xl border border-dashed flex items-center justify-center">
        <IconCircleMinus size={64} className="text-scroll" stroke={1} />
      </div>
      <div className="font-medium mt-5 text-muted-foreground">
        No conversations selected
      </div>
      <div className="text-accent-foreground mt-2">
        Please select a conversation to view its details.
      </div>
    </div>
  );
};
