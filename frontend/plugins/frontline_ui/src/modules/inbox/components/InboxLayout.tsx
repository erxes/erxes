import { useConversationListVisibility } from '@/inbox/hooks/useConversationListVisibility';
import { useInboxLayout } from '@/inbox/hooks/useInboxLayout';
import { Resizable, cn, useQueryState } from 'erxes-ui';
import { useLayoutEffect, useRef, useState } from 'react';
import { InboxLayoutContext } from '../states/inboxLayoutContext';

export const InboxLayout = ({
  conversations,
  conversationDetail,
}: {
  conversations: React.ReactNode;
  conversationDetail: React.ReactNode;
}) => {
  const preferredLayout = useInboxLayout();
  const { isHidden } = useConversationListVisibility();
  const [conversationId] = useQueryState('conversationId');
  const root = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => setWidth(element.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const layout = preferredLayout === 'split' && width >= 640 ? 'split' : 'list';
  const listContent = conversationId ? conversationDetail : conversations;
  const collapse = isHidden && Boolean(conversationId) && 'hidden';
  return (
    <div ref={root} className="min-h-0 min-w-0 flex-1 overflow-hidden">
      <InboxLayoutContext.Provider value={layout}>
        {layout === 'list' ? (
          listContent
        ) : (
          <Resizable.PanelGroup
            direction="horizontal"
            autoSaveId="frontline-inbox-split-v3"
            className="h-full"
          >
            <Resizable.Panel
              defaultSize={(Math.min(350, width - 360) / width) * 100}
              minSize={(280 / width) * 100}
              maxSize={(Math.min(440, width - 360) / width) * 100}
              className={cn(collapse)}
            >
              {conversations}
            </Resizable.Panel>
            <Resizable.Handle
              aria-label="Resize conversation list"
              className={cn(
                'transition-colors hover:bg-primary/40 data-[resize-handle-state=drag]:bg-primary/60',
                collapse,
              )}
            />
            <Resizable.Panel
              defaultSize={100 - (Math.min(350, width - 360) / width) * 100}
              minSize={(360 / width) * 100}
              className="min-w-0"
            >
              {conversationDetail}
            </Resizable.Panel>
          </Resizable.PanelGroup>
        )}
      </InboxLayoutContext.Provider>
    </div>
  );
};
