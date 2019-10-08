import { Popover } from 'modules/common/styles/main';
import { PopoverContent } from 'modules/notifications/components/styles';
import ModulItem from 'modules/robot/components/ModulItem';
import { Bot, Greeting } from 'modules/robot/components/styles';
import * as React from 'react';
import { OverlayTrigger } from 'react-bootstrap';
import AssistantDetail from './AssistantDetail';

class Assistant extends React.Component<{}, { isDetail: boolean }> {
  constructor(props) {
    super(props);

    this.update = this.update.bind(this);

    this.state = {
      isDetail: false
    };
  }

  update() {
    // rerender component
    this.forceUpdate();
  }

  goDetail = () => {
    this.setState({ isDetail: true });
  };

  renderHome = () => {
    if (this.state.isDetail) {
      return <AssistantDetail />;
    }

    return (
      <>
        <Greeting>
          Good morning!{' '}
          <b>
            Ganzorig{' '}
            <span role="img" aria-label="Wave">
              👋
            </span>
          </b>
          <br /> What module do you use usually?
        </Greeting>

        <ModulItem
          onClick={this.goDetail}
          title="Customer merge"
          description="Combine client and team"
          icon="users"
          color="#ec542b"
        />
        <ModulItem
          title="Company meta"
          description="Combine client and team"
          color="#3599cb"
          icon="briefcase"
        />

        <ModulItem
          title="Customer Scoring"
          description="Combine client and team"
          color="#27b553"
          icon="user-2"
        />
        <ModulItem
          title="Start onboarding"
          description="Combine client and team"
          color="#de59b2"
          icon="list-2"
        />
      </>
    );
  };

  renderPopoverContent() {
    return <PopoverContent>{this.renderHome()}</PopoverContent>;
  }

  render() {
    const content = <Popover>{this.renderPopoverContent()}</Popover>;

    return (
      <OverlayTrigger
        trigger="click"
        rootClose={true}
        placement="top"
        containerPadding={15}
        overlay={content}
        shouldUpdatePosition={true}
      >
        <Bot>
          <img src="/images/erxes-bot.svg" alt="ai robot" />
        </Bot>
      </OverlayTrigger>
    );
  }
}

export default Assistant;
