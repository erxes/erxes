import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
import TodoDetail from '../containers/TodoDetail';
import { IFeature } from '../types';
import { getCurrentUserName } from '../utils';
import ModulItem from './ModulItem';
import {
  CompletedTaskName,
  CompletedTaskWrapper,
  Greeting,
  NavButton,
  SubHeader
} from './styles';

type Props = {
  availableFeatures: IFeature[];
  currentRoute?: string;
  changeRoute: (route: string) => void;
  currentUser: IUser;
  showContent: boolean;
  toggleContent: (isShow: boolean) => void;
};

type State = {
  selectedFeature?: IFeature;
  showComplete: boolean;
};

class Todo extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { selectedFeature: undefined, showComplete: true };
  }

  withHeader = (content: React.ReactNode) => {
    const { changeRoute, currentRoute, toggleContent } = this.props;

    const onBack = () => {
      changeRoute('todoList');
    };

    const onHide = () => {
      toggleContent(false);
    };

    return (
      <>
        {currentRoute === 'todoDetail' && (
          <NavButton onClick={onBack}>
            <Icon icon="arrow-left" size={24} />
          </NavButton>
        )}

        <NavButton onClick={onHide} right={true}>
          <Icon icon="times" size={17} />
        </NavButton>
        {content}
      </>
    );
  };

  renderFeature(feature: IFeature, completed?: boolean) {
    const { changeRoute } = this.props;
    const { text, isComplete, icon, color, name } = feature;

    const onClick = () => {
      this.setState({ selectedFeature: feature }, () => {
        changeRoute('todoDetail');
      });
    };

    const title = `${__('Configure')} ${text}`;

    if (completed) {
      return (
        <CompletedTaskName key={name} onClick={onClick}>
          {title}
        </CompletedTaskName>
      );
    }

    return (
      <ModulItem
        title={title}
        icon={icon}
        color={color}
        key={name}
        onClick={onClick}
        isComplete={isComplete}
      />
    );
  }

  renderCompleted = () => {
    const { availableFeatures } = this.props;
    const completedTasks = availableFeatures.filter(
      feature => feature.isComplete
    );

    if (completedTasks.length === 0) {
      return;
    }

    const { showComplete } = this.state;

    return (
      <CompletedTaskWrapper>
        <SubHeader onClick={this.toggleFeatures}>
          {__('Show completed')}
          <Icon icon={showComplete ? 'angle-down' : 'angle-up'} />
        </SubHeader>
        {showComplete &&
          completedTasks.map(availabeFeature =>
            this.renderFeature(availabeFeature, true)
          )}
      </CompletedTaskWrapper>
    );
  };

  renderContent() {
    const { selectedFeature } = this.state;
    const { availableFeatures, currentRoute, currentUser } = this.props;

    if (currentRoute === 'todoDetail') {
      return this.withHeader(
        selectedFeature && <TodoDetail feature={selectedFeature} />
      );
    }

    if (currentRoute === 'todoList') {
      return this.withHeader(
        <>
          <Greeting>
            <b>
              Hello! {getCurrentUserName(currentUser)}
              <span role="img" aria-label="Wave">
                👋
              </span>
            </b>
            <p>Let's get your set up workspace for success.</p>
          </Greeting>
          {availableFeatures
            .filter(feature => !feature.isComplete)
            .map(availabeFeature => this.renderFeature(availabeFeature))}

          {this.renderCompleted()}
        </>
      );
    }

    return null;
  }

  toggleFeatures = () => {
    this.setState({ showComplete: !this.state.showComplete });
  };

  render() {
    return this.renderContent();
  }
}

export default Todo;
