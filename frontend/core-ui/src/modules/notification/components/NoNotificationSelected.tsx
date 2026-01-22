import { IconCircleMinus } from '@tabler/icons-react';

export const NoNotificationSelected = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="size-24 bg-sidebar rounded-xl border border-dashed flex items-center justify-center">
        <IconCircleMinus
          className="text-accent-foreground size-12"
          stroke={1}
        />
      </div>
      <div className="text-lg font-medium mt-5 text-muted-foreground">
        No notification selected
      </div>
      <div className="text-accent-foreground mt-2 text-sm">
        Please select a notification to view its details.
      </div>
    </div>
  );
};
