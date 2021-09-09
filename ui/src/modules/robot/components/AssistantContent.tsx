import { IUser } from 'modules/auth/types';
import React from 'react';
import RTG from 'react-transition-group';
import { IFeature, IRoleValue } from '../types';
import { getCurrentUserName } from '../utils';
import Onboarding from './onboard/Onboarding';
import Setup from './Setup';
import { Content } from './styles';
import Suggestion from './Suggestion';

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
  roleValue: IRoleValue;
  answerOf: IRoleValue;
};

class AssistantContent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      welcomeStep: 0,
      roleValue: { value: 'sales', label: 'Sales' } as IRoleValue,
      answerOf: {} as IRoleValue
    };
  }

  restartRole = (roleValue: IRoleValue, answerOf: IRoleValue) => {
    this.setState({
      welcomeStep: 1,
      roleValue,
      answerOf
    });
    this.props.changeRoute('initial');
  };

  renderContent() {
    const {
      currentRoute,
      changeRoute,
      currentUser,
      forceComplete,
      savedFeatures,
      toggleContent
    } = this.props;

    const commonProps = {
      forceComplete,
      toggleContent,
      currentUserName: getCurrentUserName(currentUser)
    };

    const onClick = () => {
      changeRoute('setupList');
    };

    const getRoleOptions = (roleValue: IRoleValue) => {
      this.setState({ roleValue });
    };

    const getAnswerOf = (answerOf: IRoleValue) => {
      this.setState({ answerOf });
    };

    const onBoarding = (
      <Onboarding
        getRoleOptions={getRoleOptions}
        getAnswerOf={getAnswerOf}
        currentUserName={getCurrentUserName(currentUser)}
        changeRoute={changeRoute}
        activeStep={this.state.welcomeStep}
        roleValue={this.state.roleValue}
        answerOf={this.state.answerOf}
        toggleContent={this.props.toggleContent}
      />
    );

    if (currentRoute === 'initial') {
      return onBoarding;
    }

    if (currentRoute === 'inComplete') {
      if (!savedFeatures) {
        changeRoute('setupList');
      }

      return <Suggestion {...commonProps} onResumeClick={onClick} />;
    }

    if (currentRoute === 'setupList' || currentRoute === 'setupDetail') {
      return (
        <Setup
          {...this.props}
          roleValue={this.state.roleValue}
          restartRole={this.restartRole}
          answerOf={this.state.answerOf}
        />
      );
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
