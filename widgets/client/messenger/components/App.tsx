import * as React from 'react';
import { CSSTransition } from 'react-transition-group';
import asyncComponent from '../../AsyncComponent';
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

  if (isMessengerVisible) return <MessengerContainer />;
  return renderLauncher();
};

{
  /* // <div className="erxes-widget">
         <CSSTransition
          in={isMessengerVisible}
          timeout={300}
          classNames="scale-in"
          unmountOnExit={true}
        > */
}
{
  /* <div className="erxes-messenger"> */
}

{
  /* </div> */
}
{
  /* </CSSTransition> */
}
{
  /* {this.renderLauncher()} 
      // </div>*/
}
export default App;
