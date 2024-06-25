import * as React from 'react';
import TopBar from '../components/TopBar';
import { connection } from '../connection';
import { useAppContext } from './AppContext';

type Props = {
  middle: React.ReactNode;
  buttonIcon?: React.ReactNode;
  isExpanded?: boolean;
  onLeftButtonClick?: (e: React.FormEvent<HTMLButtonElement>) => void;
  toggleHead?: () => void;
};

const container = (props: Props) => {
  const {
    endConversation,
    toggle,
    setHeadHeight,
    headHeight,
    getUiOptions,
    exportConversation,
    activeConversation,
  } = useAppContext();

  return (
    <TopBar
      {...props}
      activeConversation={activeConversation}
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

export default container;
