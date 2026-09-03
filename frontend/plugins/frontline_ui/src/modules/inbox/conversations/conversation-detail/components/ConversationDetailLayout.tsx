import { Resizable } from 'erxes-ui';

export const ConversationDetailLayout = ({
  children,
  input,
}: {
  children: React.ReactNode;
  input: React.ReactNode;
}) => {
  return (
    <Resizable.PanelGroup direction="vertical">
      <Resizable.Panel
        defaultSize={input ? 70 : 100}
        minSize={30}
        className="min-h-0"
      >
        <div className="relative h-full overflow-hidden">{children}</div>
      </Resizable.Panel>
      {input && (
        <>
          <Resizable.Handle className="bg-transparent hover:bg-border" />
          <Resizable.Panel defaultSize={30} minSize={20} className="min-h-56">
            {input}
          </Resizable.Panel>
        </>
      )}
    </Resizable.PanelGroup>
  );
};
