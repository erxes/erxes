import { teamMemberDetailActiveActionTabAtom } from '@/settings/team-member/states/teamMemberDetailStates';
import { IconLayoutSidebarLeftCollapse } from '@tabler/icons-react';
import {
  Button,
  cn,
  Sheet,
  usePreviousHotkeyScope,
  useQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import React from 'react';

export const MemberDetailSheet = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof Sheet>) => {
  const [open, setOpen] = useQueryState<string>('user_id');
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();

  const activeTab = useAtomValue(teamMemberDetailActiveActionTabAtom);

  return (
    <Sheet
      open={!!open}
      onOpenChange={() => {
        setOpen(null);
        goBackToPreviousHotkeyScope();
      }}
      {...props}
    >
      <Sheet.View
        className={cn(
          'p-0 md:w-[calc(100vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl',
          !!activeTab && 'md:w-[calc(100vw-theme(spacing.4))]',
          className,
        )}
      >
        <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
          <Button variant="ghost" size="icon">
            <IconLayoutSidebarLeftCollapse />
          </Button>
          <Sheet.Title>Team Member Detail</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            Team Member Detail
          </Sheet.Description>
        </Sheet.Header>
        {children}
      </Sheet.View>
    </Sheet>
  );
};
