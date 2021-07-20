import debounce from 'lodash/debounce';
import { IUser } from 'modules/auth/types';
import Version from 'modules/settings/status/containers/Version';
import * as React from 'react';
import RTG from 'react-transition-group';
import AssistantContent from '../containers/AssistantContent';
import { Bot, BotWrapper } from './styles';
import { __ } from 'modules/common/utils';

type Props = {
  currentUser: IUser;
  collapsed: boolean;
};

type State = {
  currentRoute: string;
  showContent: boolean;
};

class Robot extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { currentRoute: 'todoList', showContent: false };
  }

  changeRoute = (currentRoute: string) => {
    this.setState({ currentRoute });
  };

  renderContent = () => {
    const { currentUser } = this.props;

    return (
      <>
        <Version showNotify={!this.state.showContent} kind="notify" />
        <AssistantContent
          changeRoute={this.changeRoute}
          currentUser={currentUser}
          currentRoute={this.state.currentRoute}
          showContent={this.state.showContent}
          toggleContent={this.toggleContent}
        />
      </>
    );
  };

  toggleContent = (isShow: boolean) => {
    this.setState({ showContent: isShow }, () => {
      if (!isShow) {
        debounce(() => this.changeRoute('todoList'), 500)();
      }
    });
  };

  changeContent = () => {
    const { currentRoute } = this.state;

    if (currentRoute && !currentRoute.includes('todo')) {
      return;
    }

    return this.toggleContent(!this.state.showContent);
  };

  render() {
    const { collapsed } = this.props;

    return (
      <>
        {this.renderContent()}
        <RTG.CSSTransition
          in={true}
          appear={true}
          timeout={2600}
          classNames="robot"
        >
          <Bot onClick={this.changeContent} collapsed={collapsed}>
            <BotWrapper collapsed={collapsed}>
              <span>
                <img src="/images/erxes-bot.svg" alt="assistant robot" />
              </span>
              {collapsed && <>{__('Need Help')}?</>}
            </BotWrapper>
          </Bot>
        </RTG.CSSTransition>
      </>
    );
  }
}

export default Robot;
