import * as React from "react";

import MessengerContainer from "../containers/Messenger";
import { useConversation } from "../context/Conversation";

type Props = {
  showLauncher: boolean;
};

const App: React.FC<Props> = ({ showLauncher }) => {
  const { isMessengerVisible } = useConversation();

  return isMessengerVisible ? (
    <div className="erxes-messenger">
      <MessengerContainer />
    </div>
  ) : null;
};

export default App;
