import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import ProgressBar from 'modules/common/components/ProgressBar';
import { __ } from 'modules/common/utils';
import React from 'react';
import TodoDetail from '../containers/TodoDetail';
import { IFeature } from '../types';
import { calculatePercentage, getCurrentUserName } from '../utils';
import ModulItem from './ModulItem';
import {
  CompletedTaskName,
  CompletedTaskWrapper,
  ContentWrapper,
  Greeting,
  NavButton,
  ProgressText,
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

  renderProgress = () => {
    const percentage = this.getPercentage();
    let text = 'keep going!';

    if (percentage < 75 && percentage > 50) {
      text = "you're halfway through, keep going!";
    }

    if (percentage > 75 && percentage < 100) {
      text = 'almost done, just a little more!';
    }

    if (percentage === 100) {
      text = 'awesome!';
    }

    return (
      <div>
        <ProgressBar percentage={percentage} color="#3B85F4" height="8px" />
        <ProgressText>
          {percentage}% done - {text}
        </ProgressText>
      </div>
    );
  };

  renderFeature(feature: IFeature, completed?: boolean) {
    const { changeRoute } = this.props;
    const { text, icon, color, name } = feature;

    const onClick = () => {
      this.setState({ selectedFeature: feature }, () => {
        changeRoute('todoDetail');
      });
    };

    if (completed) {
      return (
        <CompletedTaskName key={name} onClick={onClick}>
          {text}
        </CompletedTaskName>
      );
    }

    return (
      <ModulItem
        title={text}
        icon={icon}
        color={color}
        key={name}
        onClick={onClick}
      />
    );
  }

  renderCompleted = () => {
    const { availableFeatures } = this.props;
    const completedTasks = availableFeatures.filter(
      feature => feature.isComplete
    );

    const { showComplete } = this.state;

    return (
      <CompletedTaskWrapper>
        <SubHeader onClick={this.toggleFeatures}>
          {__('Show completed')}
          <Icon icon={showComplete ? 'angle-down' : 'angle-up'} />
        </SubHeader>
        {showComplete && (
          <>
            {completedTasks.map(availabeFeature =>
              this.renderFeature(availabeFeature, true)
            )}
            <CompletedTaskName>{__('Set up your account')}</CompletedTaskName>
          </>
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
      const percentage = this.getPercentage();
      let text = "Let's set up your workplace for success";

      if (percentage === 100) {
        text = 'Congratulations! You have finished setting up';
      }

      return this.withHeader(
        <>
          <Greeting>
            <b>
              {__('Hello')}! {getCurrentUserName(currentUser)}
              <span role="img" aria-label="Wave">
                👋
              </span>
            </b>
            <p>{__(text)}.</p>

            {this.renderProgress()}
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

  getPercentage() {
    const { availableFeatures } = this.props;
    const completedCount = availableFeatures.filter(
      feature => feature.isComplete
    ).length;

    return calculatePercentage(
      availableFeatures.length + 1,
      completedCount + 1
    );
  }

  render() {
    return <ContentWrapper>{this.renderContent()}</ContentWrapper>;
  }
}

export default Todo;
