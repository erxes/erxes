import * as classNames from "classnames";
import * as dayjs from "dayjs";
import * as React from "react";
import * as RTG from "react-transition-group";
import { facebook, twitter, youtube } from "../../icons/Icons";
import {
  IIntegrationLink,
  IIntegrationMessengerData,
  IIntegrationMessengerDataMessagesItem,
  IUser,
} from "../../types";
import { __ } from "../../utils";
import { Integrations, TopBar } from "../containers";
import { SocialLink, Supporters } from "./common";
import { FaqCategories } from "./faq";

type Props = {
  supporters: IUser[];
  loading?: boolean;
  color?: string;
  messengerData: IIntegrationMessengerData;
  isOnline?: boolean;
  serverTime?: string;
};

type State = {
  headHeight: number;
  activeSupport: boolean;
};

class Home extends React.Component<Props, State> {
  private node: HTMLDivElement | null = null;

  constructor(props: Props) {
    super(props);

    this.state = { headHeight: 120, activeSupport: true };
    this.toggleTab = this.toggleTab.bind(this);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.node && prevState.headHeight !== this.node.offsetHeight) {
      this.setState({ headHeight: this.node.offsetHeight });
    }
  }

  componentDidMount() {
    if (this.node) {
      this.setState({ headHeight: this.node.offsetHeight });
    }
  }

  toggleTab() {
    this.setState({ activeSupport: !this.state.activeSupport });
  }

  renderTab() {
    const { messengerData } = this.props;

    if (!messengerData.knowledgeBaseTopicId) {
      return null;
    }

    const indicatorClasses = classNames("indicator", {
      left: this.state.activeSupport,
    });

    return (
      <div className="erxes-tab" onClick={this.toggleTab}>
        <div
          style={{ backgroundColor: this.props.color }}
          className={indicatorClasses}
        />
        <span>{__("Support")}</span>
        <span>{__("Faq")}</span>
      </div>
    );
  }

  renderGreetings(messengerData: IIntegrationMessengerData) {
    const messages =
      messengerData.messages || ({} as IIntegrationMessengerDataMessagesItem);

    const greetings = messages.greetings || {};

    return (
      <div className="welcome-info">
        <h3>{greetings.title || __("Welcome")}</h3>
        <div className="description">
          {greetings.message || __("Welcome description")}
        </div>
      </div>
    );
  }

  renderAssistBar(messengerData: IIntegrationMessengerData) {
    const links = messengerData.links || ({} as IIntegrationLink);

    return (
      <div className="assist-bar">
        <time>{dayjs(new Date()).format("lll")}</time>
        <div className="socials">
          <SocialLink url={links.facebook} icon={facebook} />
          <SocialLink url={links.twitter} icon={twitter} />
          <SocialLink url={links.youtube} icon={youtube} />
        </div>
      </div>
    );
  }

  renderServerInfo(timezone?: string, serverTime?: string) {
    return (
      <div className="server-info">
        <time>Server time: {dayjs(serverTime).format("lll")}</time>
        <p>Timezone: {timezone || "not specified"}</p>
      </div>
    );
  }

  renderHead() {
    const {
      isOnline,
      supporters,
      loading,
      messengerData,
      serverTime,
    } = this.props;

    return (
      <div
        className={classNames("erxes-welcome", {
          tabbed: messengerData.knowledgeBaseTopicId,
        })}
        ref={(node) => {
          this.node = node;
        }}
      >
        {this.renderAssistBar(messengerData)}
        {this.renderGreetings(messengerData)}
        <Supporters
          users={supporters}
          isExpanded={false}
          loading={loading}
          isOnline={isOnline}
        />
        {this.renderServerInfo(messengerData.timezone, serverTime)}
        {this.renderTab()}
      </div>
    );
  }

  render() {
    const { messengerData } = this.props;
    const topicId = messengerData.knowledgeBaseTopicId;

    return (
      <div
        className="erxes-home-container"
        style={{ paddingTop: this.state.headHeight }}
      >
        <TopBar middle={this.renderHead()} />
        <div
          className={classNames("erxes-home-content", {
            tabbed: topicId,
          })}
        >
          <RTG.CSSTransition
            in={this.state.activeSupport}
            appear={true}
            timeout={600}
            classNames="slide"
          >
            <div className="erxes-home-item">
              <Integrations />
            </div>
          </RTG.CSSTransition>

          <RTG.CSSTransition
            in={!this.state.activeSupport}
            appear={true}
            timeout={600}
            classNames="slide"
            unmountOnExit={true}
          >
            <div className="erxes-home-item seperate">
              <FaqCategories topicId={topicId} />
            </div>
          </RTG.CSSTransition>
        </div>
      </div>
    );
  }
}

export default Home;
