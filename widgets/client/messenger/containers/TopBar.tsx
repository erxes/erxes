import * as React from 'react';
import TopBar from '../components/TopBar';
import { connection } from '../connection';
import { useConversation } from '../context/Conversation';
import { getUiOptions } from '../utils/util';
import { useConfig } from '../context/Config';

type Props = {
  middle: React.ReactNode;
  buttonIcon?: React.ReactNode;
  isExpanded?: boolean;
  onLeftButtonClick?: (e: React.FormEvent<HTMLButtonElement>) => void;
  toggleHead?: () => void;
};

const Container = (props: Props) => {
  const { activeConversationId, toggle, endConversation, exportConversation } =
    useConversation();

  const { headHeight, setHeadHeight } = useConfig();

  return (
    <TopBar
      {...props}
      activeConversation={activeConversationId}
      color={getUiOptions().color}
      textColor={getUiOptions().textColor || '#fff'}
      toggleLauncher={toggle}
      isChat={Boolean(!connection.setting.email)}
      endConversation={endConversation}
      exportConversation={exportConversation}
      prevHeight={headHeight}
      setHeadHeight={setHeadHeight}
    />
  );
};

export default Container;
