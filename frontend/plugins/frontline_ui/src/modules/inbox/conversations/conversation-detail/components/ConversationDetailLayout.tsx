import { Resizable } from 'erxes-ui';

export const ConversationDetailLayout = ({
  children,
  input,
}: {
  children: React.ReactNode;
  input: React.ReactNode;
}) => {
  return (
    <Resizable.PanelGroup
      direction="vertical"
      className="min-h-0 min-w-0 flex-1"
    >
      <Resizable.Panel defaultSize={input ? 70 : 100} minSize={25}>
        <div className="relative h-full min-h-0 overflow-hidden">
          {children}
        </div>
      </Resizable.Panel>
      {input && (
        <>
          <Resizable.Handle className="bg-transparent hover:bg-border" />
          <Resizable.Panel defaultSize={30} minSize={20} maxSize={60}>
            <div className="relative z-20 h-full min-h-0 overflow-y-auto border-t border-border/60 bg-background/95 backdrop-blur">
              {input}
            </div>
          </Resizable.Panel>
        </>
      )}
    </Resizable.PanelGroup>
  );
};
