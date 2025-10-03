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
      <Resizable.Panel defaultSize={70}>{children}</Resizable.Panel>
      <Resizable.Handle className="bg-transparent hover:bg-border" />
      <Resizable.Panel defaultSize={30}>{input}</Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
