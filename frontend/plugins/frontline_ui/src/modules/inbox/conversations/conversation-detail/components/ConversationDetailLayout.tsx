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
      <Resizable.Panel defaultSize={input ? 70 : 100}>
        <div className="relative h-full overflow-hidden">{children}</div>
      </Resizable.Panel>
      {input && (
        <>
          <Resizable.Handle className="bg-transparent hover:bg-border" />
          <Resizable.Panel defaultSize={30}>{input}</Resizable.Panel>
        </>
      )}
    </Resizable.PanelGroup>
  );
};
