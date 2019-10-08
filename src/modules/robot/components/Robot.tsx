import * as React from 'react';
import RTG from 'react-transition-group';
import Onboarding from '../containers/Onboarding';
import { IEntry } from '../types';
import Assistant from './assistant/Assistant';
import { Bot } from './styles';

type Props = {
  entries: IEntry[];
};

type State = {
  currentRoute: string;
};

class Robot extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { currentRoute: 'onboard' };
  }

  changeRoute = (currentRoute: string) => {
    this.setState({ currentRoute });
  };

  renderContent = () => {
    const { currentRoute } = this.state;

    return (
      <>
        <Assistant
          show={currentRoute === 'assistant'}
          changeRoute={this.changeRoute}
        />
        <Onboarding show={currentRoute === 'onboard'} />
      </>
    );
  };

  changeContent = () => {
    if (this.state.currentRoute === 'assistant') {
      return this.changeRoute('');
    }

    return this.changeRoute('assistant');
  };

  render() {
    return (
      <>
        {this.renderContent()}
        <RTG.CSSTransition
          in={true}
          appear={true}
          timeout={1800}
          classNames="robot"
        >
          <Bot onClick={this.changeContent}>
            <img src="/images/erxes-bot.svg" alt="ai robot" />
          </Bot>
        </RTG.CSSTransition>
      </>
    );
  }
}

export default Robot;
