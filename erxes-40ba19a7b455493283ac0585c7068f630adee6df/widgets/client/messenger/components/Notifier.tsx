import * as classNames from "classnames";
import * as React from "react";
import * as RTG from "react-transition-group";
import { iconClose } from "../../icons/Icons";
import { striptags } from "../../utils";
import { EngageMessage } from "../components";
import { User } from "../components/common";
import { IEngageData, IMessage } from "../types";

type Props = {
  message: IMessage;
  readConversation: (conversationId: string) => void;
  showUnreadMessage: () => void;
  toggleNotifier: (isVisible: boolean) => void;
};

type State = {
  isVisible: boolean;
};

class Notifier extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isVisible: true };
  }

  componentDidMount() {
    this.props.showUnreadMessage();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.isVisible === this.state.isVisible) {
      this.props.showUnreadMessage();
    }
  }

  close() {
    this.props.toggleNotifier(true);
    this.setState({ isVisible: !this.state.isVisible });
  }

  renderNotificationBody() {
    const { message } = this.props;
    const { engageData, user, content } = message;

    let fullName = "";

    if (user && user.details) {
      fullName = user.details.fullName;
    }

    if (engageData) {
      return <EngageMessage user={user} engageData={engageData} />;
    }

    return (
      <div className="notification-wrapper">
        <div className="user-info">
          <User user={user} />
          {fullName}
        </div>
        <div className="notification-body">{striptags(content)}</div>
      </div>
    );
  }

  render() {
    const { message, readConversation } = this.props;
    const engageData = message.engageData || ({} as IEngageData);
    const classes = classNames("erxes-notification", {
      "full-message": engageData.sentAs === "fullMessage"
    });

    return (
      <RTG.CSSTransition
        in={this.state.isVisible}
        appear={true}
        timeout={300}
        classNames="scale-in"
        unmountOnExit={true}
      >
        <div className={classes}>
          <div
            className="flex-notification-container"
            onClick={() => readConversation(message.conversationId)}
          >
            {this.renderNotificationBody()}
          </div>
          <a
            className="close-notification"
            title="Close notification"
            onClick={() => {
              this.close();
            }}
          >
            {iconClose()}
          </a>
        </div>
      </RTG.CSSTransition>
    );
  }
}

export default Notifier;
