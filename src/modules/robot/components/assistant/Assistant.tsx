import { HomeContainer } from 'modules/common/styles/main';
import ModulItem from 'modules/robot/components/ModulItem';
import { Content, Greeting } from 'modules/robot/components/styles';
import * as React from 'react';
import RTG from 'react-transition-group';

type Props = {
  changeRoute: (route: string) => void;
  show: boolean;
};

class Assistant extends React.Component<Props> {
  startOnboard = () => {
    this.props.changeRoute('onboard');
  };

  render() {
    return (
      <RTG.CSSTransition
        in={this.props.show}
        appear={true}
        timeout={600}
        classNames="slide-in-small"
        unmountOnExit={true}
      >
        <Content>
          <HomeContainer>
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
              title="Customer merge"
              description="Combine client and team"
              icon="users"
              color="#ec542b"
              disabled={true}
            />
            <ModulItem
              title="Company meta"
              description="Combine client and team"
              color="#3599cb"
              icon="briefcase"
              disabled={true}
            />

            <ModulItem
              title="Customer Scoring"
              description="Combine client and team"
              color="#27b553"
              icon="user-2"
              disabled={true}
            />
            <ModulItem
              title="Start onboarding"
              description="Combine client and team"
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
