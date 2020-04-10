import { IUser } from 'modules/auth/types';
import React from 'react';
import RTG from 'react-transition-group';
import { IFeature } from '../types';
import { getCurrentUserName } from '../utils';
import { Content } from './styles';
import Suggestion from './Suggestion';
import Todo from './Todo';
import Welcome from './Welcome';

type Props = {
  availableFeatures: IFeature[];
  currentRoute?: string;
  changeRoute: (route: string) => void;
  forceComplete: () => void;
  currentUser: IUser;
  showContent: boolean;
  toggleContent: (isShow: boolean) => void;
};

type State = {
  selectedFeature?: IFeature;
  featureLimit: number;
};

class AssistantContent extends React.Component<Props, State> {
  renderContent() {
    const {
      currentRoute,
      changeRoute,
      currentUser,
      forceComplete
    } = this.props;

    const commonProps = {
      forceComplete,
      currentUserName: getCurrentUserName(currentUser)
    };

    const onClick = () => {
      changeRoute('todoList');
    };

    if (currentRoute === 'initial') {
      return <Welcome currentUserName={getCurrentUserName(currentUser)} />;
    }

    if (currentRoute === 'inComplete') {
      return (
        <Suggestion {...commonProps} buttonText="Resume" onClick={onClick} />
      );
    }

    if (currentRoute === 'todoList' || currentRoute === 'todoDetail') {
      return <Todo {...this.props} />;
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
