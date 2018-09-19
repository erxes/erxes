import * as React from "react";
import { iconPlus } from "../../icons/Icons";
import { IUser } from "../../types";
import { __ } from "../../utils";
import { BrandInfo, ConversationList, TopBar } from "../containers";
import { IntegrationItem, Supporters } from "./";

type Props = {
  createConversation: (e: React.FormEvent<HTMLButtonElement>) => void;
  supporters: IUser[];
  loading?: boolean;
};

type State = {
  headHeight: number;
};

class Home extends React.Component<Props, State> {
  private node: HTMLDivElement | null = null;

  constructor(props: Props) {
    super(props);

    this.state = { headHeight: 120 };
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

  renderHead() {
    const { supporters, loading } = this.props;

    return (
      <div
        className="erxes-welcome appear-slide-in"
        ref={node => {
          this.node = node;
        }}
      >
        <BrandInfo />
        <Supporters users={supporters} isExpanded={false} loading={loading} />
      </div>
    );
  }

  render() {
    const { createConversation } = this.props;

    return (
      <div
        className="erxes-home-container"
        style={{ paddingTop: this.state.headHeight - 30 }}
      >
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
