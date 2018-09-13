import * as React from "react";
import { iconPlus } from "../../icons/Icons";
import { IUser } from "../../types";
import { __ } from "../../utils";
import { ConversationList, TopBar } from "../containers";
import { IntegrationItem, Supporters } from "./";

type Props = {
  createConversation: (e: React.FormEvent<HTMLButtonElement>) => void;
  users: IUser[];
  loading?: boolean;
};

class Home extends React.Component<Props> {
  renderHead() {
    const { users, loading } = this.props;

    return (
      <div className="erxes-welcome appear-slide-in">
        <h3>{__("Welcome!")}</h3>
        <Supporters users={users} isExpanded={true} loading={loading} />
      </div>
    );
  }

  render() {
    const { createConversation } = this.props;

    return (
      <div className="erxes-home-container">
        <TopBar
          isBig
          middle={this.renderHead()}
          buttonIcon={iconPlus}
          onButtonClick={createConversation}
        />
        <IntegrationItem title="Recent conversations">
          <ConversationList />
        </IntegrationItem>
      </div>
    );
  }
}

export default Home;
