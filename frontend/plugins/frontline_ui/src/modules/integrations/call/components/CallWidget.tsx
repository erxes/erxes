import { Popover as PopoverPrimitive } from 'radix-ui';
import { IconDots } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { CallWidgetDraggableRoot } from '@/integrations/call/components/CallWidgetDraggable';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { callWidgetPositionState } from '@/integrations/call/states/callWidgetStates';
import {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  CallDirectionEnum,
  CallStatusEnum,
  ISipState,
} from '@/integrations/call/types/sipTypes';
import { sipStateAtom } from '@/integrations/call/states/sipStates';
import { CallTabs, Dialpad } from '@/integrations/call/components/CallTabs';
import { callWidgetOpenAtom } from '@/integrations/call/states/callWidgetOpenAtom';
import { InCall } from '@/integrations/call/components/InCall';
import {
  IncomingCallAudio,
  IncomingCall,
} from '@/integrations/call/components/IncomingCall';
import { CallTriggerContent } from '@/integrations/call/components/CallTriggerContent';
import {
  currentCallConversationIdAtom,
  historyIdAtom,
} from '@/integrations/call/states/callStates';
import { useAddCallCustomer } from '@/integrations/call/hooks/useAddCustomer';

export const CallWidgetContent = () => {
  const [sipState] = useAtom<ISipState>(sipStateAtom);
  const setHistoryId = useSetAtom(historyIdAtom);
  const setCurrentCallConversationId = useSetAtom(
    currentCallConversationIdAtom,
  );
  const { addCustomer, customer, channels, loading } = useAddCallCustomer();

  useEffect(() => {
    if (sipState.callStatus === CallStatusEnum.ENDED) {
      setHistoryId(null);
      setCurrentCallConversationId(null);
    }
  }, [sipState.callStatus, setHistoryId, setCurrentCallConversationId]);

  if (sipState.callStatus === CallStatusEnum.IDLE) {
    return <CallTabs keypad={<Dialpad addCustomer={addCustomer} />} />;
  }

  if (
    sipState.callDirection === CallDirectionEnum.INCOMING &&
    sipState.callStatus === CallStatusEnum.STARTING
  ) {
    return (
      <IncomingCall
        addCustomer={addCustomer}
        customer={customer}
        channels={channels}
        loading={loading}
      />
    );
  }

  return (
    <CallTabs
      keypad={
        <InCall customer={customer} channels={channels} loading={loading} />
      }
    />
  );
};

export const CallWidgetMoreActions = () => {
  const setPositionState = useSetAtom(callWidgetPositionState);
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="size-9 bg-muted [&_svg]:size-5 ml-auto"
        >
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Call history</DropdownMenu.Item>
        <DropdownMenu.Item>Settings</DropdownMenu.Item>
        <DropdownMenu.Item>Hide</DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => setPositionState({ x: 0, y: 0 })}>
          Reset position
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const CallWidget = () => {
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>();
  const open = useAtomValue(callWidgetOpenAtom);
  const sipState = useAtomValue(sipStateAtom);
  const setOpen = useSetAtom(callWidgetOpenAtom);

  useLayoutEffect(() => {
    if (popoverContentRef.current) {
      setContentHeight(popoverContentRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    if (
      sipState.callDirection === CallDirectionEnum.INCOMING &&
      sipState.callStatus === CallStatusEnum.STARTING
    ) {
      setOpen(true);
    }
    if (sipState.callStatus === CallStatusEnum.IDLE) {
      setOpen(false);
    }
  }, [sipState.callDirection, sipState.callStatus, setOpen]);

  return (
    <>
      <IncomingCallAudio />
      <PopoverPrimitive.Root open={open}>
        <CallWidgetDraggableRoot trigger={<CallTriggerContent />}>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              sideOffset={12}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
              }}
              ref={popoverContentRef}
              style={
                {
                  '--radix-popper-content-height': contentHeight,
                } as CSSProperties
              }
              className="z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 rounded-lg bg-background text-foreground shadow-lg min-w-80"
            >
              <CallWidgetContent />
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </CallWidgetDraggableRoot>
      </PopoverPrimitive.Root>
    </>
  );
};
