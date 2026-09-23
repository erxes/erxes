import { Resizable } from 'erxes-ui';
import { useComposerPanelResize } from '@/inbox/conversations/conversation-detail/hooks/useComposerPanelResize';

export const ConversationDetailLayout = ({
  children,
  input,
}: {
  children: React.ReactNode;
  input: React.ReactNode;
}) => {
  const { inputPanelRef, expandForContent } = useComposerPanelResize();

  return (
    <Resizable.PanelGroup
      direction="vertical"
      className="min-h-0 min-w-0 flex-1"
      onInputCapture={(event) => expandForContent(event.target)}
      onFocusCapture={(event) => expandForContent(event.target)}
    >
      <Resizable.Panel defaultSize={input ? 75 : 100} minSize={0}>
        <div className="relative h-full min-h-0 overflow-hidden">
          {children}
        </div>
      </Resizable.Panel>
      {input && (
        <>
          <Resizable.Handle className="bg-transparent hover:bg-border" />
          <Resizable.Panel
            ref={inputPanelRef}
            defaultSize={25}
            minSize={20}
            maxSize={100}
          >
            <div className="relative z-20 h-full min-h-0 border-t border-border/60 bg-background/95 backdrop-blur">
              {input}
            </div>
          </Resizable.Panel>
        </>
      )}
    </Resizable.PanelGroup>
  );
};
