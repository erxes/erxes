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
        defaultSize={input ? 80 : 100}
        minSize={input ? 55 : 100}
      >
        <div className="relative h-full overflow-hidden">{children}</div>
      </Resizable.Panel>
      {input && (
        <>
          <Resizable.Handle className="bg-transparent hover:bg-border" />
          <Resizable.Panel defaultSize={20} minSize={18} maxSize={45}>
            {input}
          </Resizable.Panel>
        </>
      )}
    </Resizable.PanelGroup>
  );
};
