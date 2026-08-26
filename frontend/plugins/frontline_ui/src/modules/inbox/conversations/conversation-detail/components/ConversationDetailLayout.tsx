import { Resizable } from 'erxes-ui';

export const ConversationDetailLayout = ({
  children,
  input,
}: {
  children: React.ReactNode;
  input: React.ReactNode;
}) => {
  return (
    <Resizable.PanelGroup direction="vertical" className="min-h-0">
      <Resizable.Panel
        defaultSize={input ? 76 : 100}
        minSize={input ? 48 : undefined}
      >
        <div className="relative h-full overflow-hidden">{children}</div>
      </Resizable.Panel>
      {input && (
        <>
          <Resizable.Handle className="border-y bg-muted/30 transition-colors hover:bg-muted" />
          <Resizable.Panel
            defaultSize={24}
            minSize={18}
            maxSize={42}
            className="bg-background"
          >
            {input}
          </Resizable.Panel>
        </>
      )}
    </Resizable.PanelGroup>
  );
};
