import * as React from 'react';
import { useConversation } from '../context/Conversation';
import Launcher from '../containers/Launcher';
import MessengerContainer from '../containers/Messenger';

type Props = {
  showLauncher: boolean;
};

const App: React.FC<Props> = ({ showLauncher }) => {
  const { isMessengerVisible } = useConversation();

  const renderLauncher = () => {
    if (!showLauncher) {
      return null;
    }

    return <Launcher />;
  };

  return isMessengerVisible ? (
    <div className="erxes-messenger">
      <MessengerContainer />
    </div>
  ) : null;
};

{
  /* <div className="erxes-widget">
    <CSSTransition
      in={isMessengerVisible}
      timeout={300}
      classNames="scale-in"
      unmountOnExit={true}
    >
      <div className="erxes-messenger"></div>
    </CSSTransition>

    {this.renderLauncher()}
  </div>; */
}

export default App;
