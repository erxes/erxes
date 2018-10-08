import * as classNames from "classnames";
import * as moment from "moment";
import * as React from "react";
import { IUser } from "../../types";
import { __ } from "../../utils";
import { BrandInfo, ConversationList, TopBar } from "../containers";
import { IntegrationItem, Supporters } from "./";

type Props = {
  supporters: IUser[];
  loading?: boolean;
  color?: string;
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

  renderHead() {
    const { supporters, loading, color } = this.props;

    const indicatorClasses = classNames("indicator", {
      left: this.state.activeSupport
    });

    return (
      <div
        className="erxes-welcome"
        ref={node => {
          this.node = node;
        }}
      >
        <time>{moment(new Date()).format("MMMM Do YYYY, h:mm a")}</time>
        <BrandInfo />
        <Supporters users={supporters} isExpanded={false} loading={loading} />
        <div className="erxes-tab" onClick={this.toggleTab}>
          <div
            style={{ backgroundColor: color }}
            className={indicatorClasses}
          />
          <span>Support</span>
          <span>FAQ</span>
        </div>
      </div>
    );
  }

  render() {
    const { color } = this.props;

    return (
      <div
        className="erxes-home-container"
        style={{ paddingTop: this.state.headHeight }}
      >
        <TopBar middle={this.renderHead()} />

        <div className="home-content slide-in">
          <IntegrationItem title="Recent conversations">
            <ConversationList />
          </IntegrationItem>
        </div>
      </div>
    );
  }
}

export default Home;
