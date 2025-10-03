import { IconLayoutSidebarLeftCollapse } from '@tabler/icons-react';
import { Button, cn, Sheet, useSetHotkeyScope } from 'erxes-ui';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useQueryState } from 'erxes-ui';
import { renderingPosDetailAtom } from '@/pos/states/posDetail';
import { PosHotKeyScope } from '@/pos/types/posHotkeyScope';

export const PosDetailSheet = ({ children }: { children: React.ReactNode }) => {
  const [activeTab] = useAtom(renderingPosDetailAtom);
  const setHotkeyScope = useSetHotkeyScope();
  const [posId, setPosId] = useQueryState<string>('pos_id');

  useEffect(() => {
    if (posId) {
      setHotkeyScope(PosHotKeyScope.PosEditSheet);
    }
  }, [posId, setHotkeyScope]);

  const setOpen = (newPosId: string | null) => {
    setPosId(newPosId);

    if (!newPosId) {
      setHotkeyScope(PosHotKeyScope.PosPage);
    }
  };

  return (
    <Sheet
      open={!!posId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null);
          setHotkeyScope(PosHotKeyScope.PosPage);
        }
      }}
    >
      <Sheet.View
        className={cn(
          'p-0 md:max-w-screen-2xl flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none',
          !!activeTab && 'md:w-[calc(100vw-theme(spacing.4))]',
        )}
      >
        <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
          <Button variant="ghost" size="icon">
            <IconLayoutSidebarLeftCollapse />
          </Button>
          <Sheet.Title>Pos Detail</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">Pos Detail</Sheet.Description>
        </Sheet.Header>
        {children}
      </Sheet.View>
    </Sheet>
  );
};
