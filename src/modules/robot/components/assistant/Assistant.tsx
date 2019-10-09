import { HomeContainer } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import ModulItem from 'modules/robot/components/ModulItem';
import { Content, Greeting } from 'modules/robot/components/styles';
import * as React from 'react';
import RTG from 'react-transition-group';

type Props = {
  changeRoute: (route: string) => void;
  show: boolean;
  currentUserName: string;
};

class Assistant extends React.Component<Props> {
  startOnboard = () => {
    this.props.changeRoute('onboard');
  };

  render() {
    const { show, currentUserName } = this.props;

    return (
      <RTG.CSSTransition
        in={show}
        appear={true}
        timeout={600}
        classNames="slide-in-small"
        unmountOnExit={true}
      >
        <Content>
          <HomeContainer>
            <Greeting>
              Hello!{' '}
              <b>
                {currentUserName}
                <span role="img" aria-label="Wave">
                  👋
                </span>
              </b>
              <br /> Select the action and see specific!
            </Greeting>

            <ModulItem
              title="Customer merge"
              description={__('Automatically merge same people')}
              icon="users"
              color="#ec542b"
              disabled={true}
            />
            <ModulItem
              title="Company meta"
              description={__('Automatically retrive company info')}
              color="#3599cb"
              icon="briefcase"
              disabled={true}
            />

            <ModulItem
              title="Customer Scoring"
              description={__('Customer scoring depends on activity')}
              color="#27b553"
              icon="user-2"
              disabled={true}
            />
            <ModulItem
              title="Start onboarding"
              description={__('Your step by step guide')}
              color="#de59b2"
              icon="list-2"
              onClick={this.startOnboard}
            />
          </HomeContainer>
        </Content>
      </RTG.CSSTransition>
    );
  }
}

export default Assistant;
