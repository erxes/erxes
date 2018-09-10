import * as React from "react";
import { iconPlus } from "../../icons/Icons";
import { IUser } from "../../types";
import { __ } from "../../utils";
import { ConversationList, TopBar } from "../containers";

type Props = {
  createConversation: (e: React.FormEvent<HTMLButtonElement>) => void;
  users: IUser[];
  welcomeMessage: string;
};

class Home extends React.Component<Props> {
  render() {
    const { createConversation, welcomeMessage, users } = this.props;

    const title = <div className="erxes-welcome">{welcomeMessage}</div>;

    return (
      <React.Fragment>
        <div className="erxes-home-container">
          <TopBar
            isBig
            middle={title}
            buttonIcon={iconPlus}
            onButtonClick={createConversation}
          />
          <div className="integration-box appear-slide-in">
            <h4>Knowledge base</h4>
            <br />
            <br />
          </div>
          <div className="integration-box appear-slide-in">
            <h4>Recent conversations</h4>
            <ConversationList />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Home;
