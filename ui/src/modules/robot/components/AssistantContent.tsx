import { IUser } from 'modules/auth/types';
import React from 'react';
import RTG from 'react-transition-group';
import { IFeature } from '../types';
import { getCurrentUserName } from '../utils';
import Onboarding from './onboard/Onboarding';
import { Content } from './styles';
import Suggestion from './Suggestion';
import Todo from './Todo';

type Props = {
  availableFeatures: IFeature[];
  currentRoute?: string;
  changeRoute: (route: string) => void;
  forceComplete: () => void;
  currentUser: IUser;
  showContent: boolean;
  toggleContent: (isShow: boolean) => void;
  savedFeatures?: string | null;
};

type State = {
  welcomeStep: number;
};

class AssistantContent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { welcomeStep: 0 };
  }

  restartOnboard = () => {
    this.setState({ welcomeStep: 1 });
    this.props.changeRoute('initial');
  }

  renderContent() {
    const {
      currentRoute,
      changeRoute,
      currentUser,
      forceComplete,
      savedFeatures,
      toggleContent,
      showContent
    } = this.props;

    const commonProps = {
      forceComplete,
      toggleContent,
      currentUserName: getCurrentUserName(currentUser)
    };

    const onClick = () => {
      changeRoute('todoList');
    };

    const onBoarding = (
      <Onboarding
        currentUserName={getCurrentUserName(currentUser)}
        changeRoute={changeRoute}
        activeStep={this.state.welcomeStep}
      />
    );

    if (currentRoute === 'initial') {
      return onBoarding;
    }

    if (currentRoute === 'inComplete') {
      const { onboardingHistory } = currentUser;

      if (!savedFeatures) {
        return onBoarding;
      }

      if (
        !showContent ||
        (onboardingHistory && onboardingHistory.isCompleted)
      ) {
        return null;
      }

      return <Suggestion {...commonProps} onClick={onClick} />;
    }

    if (currentRoute === 'todoList' || currentRoute === 'todoDetail') {
      return <Todo {...this.props} restartOnboard={this.restartOnboard} />;
    }

    return null;
  }

  render() {
    const { showContent } = this.props;

    return (
      <RTG.CSSTransition
        in={showContent}
        appear={true}
        timeout={600}
        classNames="slide-in-small"
        unmountOnExit={true}
      >
        <Content>{this.renderContent()}</Content>
      </RTG.CSSTransition>
    );
  }
}

export default AssistantContent;
