import * as classNames from "classnames";
import * as moment from "moment";
import * as React from "react";
import * as ReactTransitionGroup from "react-transition-group";
import { facebook, twitter, youtube } from "../../icons/Icons";
import {
  IIntegrationLink,
  IIntegrationMessengerData,
  IIntegrationMessengerDataMessagesItem,
  IUser
} from "../../types";
import { __ } from "../../utils";
import { TopBar } from "../containers";
import { Categories as FaqCategories } from "../containers/faq";
import { Integrations } from "./";
import { SocialLink, Supporters } from "./common";

type Props = {
  supporters: IUser[];
  loading?: boolean;
  color?: string;
  messengerData: IIntegrationMessengerData;
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

  componentDidUpdate(prevProps: any, prevState: any) {
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

    if (!messengerData.showFaq) {
      return null;
    }

    const indicatorClasses = classNames("indicator", {
      left: this.state.activeSupport
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
    const greetings = messages.greetings;

    return (
      <div className="welcome-info">
        <h3>{greetings.title || __("Welcome")}</h3>
        <div className="description">
          {greetings.content || __("Welcome description")}
        </div>
      </div>
    );
  }

  renderAssistBar(messengerData: IIntegrationMessengerData) {
    const links = messengerData.links || ({} as IIntegrationLink);

    return (
      <div className="assist-bar">
        <time>{moment(new Date()).format("MMMM Do YYYY, h:mm a")}</time>
        <div className="socials">
          <SocialLink url={links.facebook} icon={facebook} />
          <SocialLink url={links.twitter} icon={twitter} />
          <SocialLink url={links.youtube} icon={youtube} />
        </div>
      </div>
    );
  }

  renderHead() {
    const { supporters, loading, messengerData } = this.props;

    return (
      <div
        className={classNames("erxes-welcome", {
          tabbed: messengerData.showFaq
        })}
        ref={node => {
          this.node = node;
        }}
      >
        {this.renderAssistBar(messengerData)}
        {this.renderGreetings(messengerData)}
        <Supporters users={supporters} isExpanded={false} loading={loading} />
        {this.renderTab()}
      </div>
    );
  }

  render() {
    return (
      <div
        className="erxes-home-container"
        style={{ paddingTop: this.state.headHeight }}
      >
        <TopBar middle={this.renderHead()} />
        <div className="erxes-home-content">
          <ReactTransitionGroup.CSSTransition
            in={this.state.activeSupport}
            appear={true}
            timeout={600}
            classNames="slide"
            unmountOnExit
          >
            <div className="erxes-home-item">
              <Integrations />
            </div>
          </ReactTransitionGroup.CSSTransition>

          <ReactTransitionGroup.CSSTransition
            in={!this.state.activeSupport}
            appear={true}
            timeout={600}
            classNames="slide"
            unmountOnExit
          >
            <div className="erxes-home-item">
              <FaqCategories />
            </div>
          </ReactTransitionGroup.CSSTransition>
        </div>
      </div>
    );
  }
}

export default Home;
