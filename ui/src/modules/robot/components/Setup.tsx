import CollapseContent from 'modules/common/components/CollapseContent';
import { __ } from 'modules/common/utils';
import { ROLE_SETUP } from 'modules/robot/constants';
import { IFeature, IRoleValue } from 'modules/robot/types';
import React from 'react';
import {
  Container,
  Greeting,
  NavButton,
  ProgressText,
  RestartButton,
  SetupList,
  SubContent,
  Text
} from './styles';
import { calculatePercentage, getCurrentUserName } from 'modules/robot/utils';
import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import SetupDetail from '../containers/SetupDetail';
import ProgressBar from 'modules/common/components/ProgressBar';

type Props = {
  currentRoute?: string;
  changeRoute: (route: string) => void;
  roleValue: IRoleValue;
  answerOf: IRoleValue;
  currentUser: IUser;
  showContent: boolean;
  toggleContent: (isShow: boolean) => void;
  restartRole: (roleValue: IRoleValue, answer: IRoleValue) => void;
  availableFeatures: IFeature[];
};

type State = {
  selectedOption: IFeature;
  showComplete: boolean;
  collapseKey: any;
};

class Setup extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedOption: {} as IFeature,
      showComplete: false,
      collapseKey: ''
    };
  }

  headerGreeting() {
    const { currentUser } = this.props;
    const percentage = this.getPercentage();

    let text = "Let's set up your workplace for success";

    if (percentage === 100) {
      text = 'Congratulations! You have finished setting up';
    }

    return (
      <Greeting>
        <b>
          {__('Hello')}! {getCurrentUserName(currentUser)}
          <span role="img" aria-label="Wave">
            👋
          </span>
        </b>
        <p>{__(text)}.</p>
      </Greeting>
    );
  }

  withHeader = (content: React.ReactNode) => {
    const { changeRoute, currentRoute, toggleContent } = this.props;

    const onBack = () => {
      changeRoute('setupList');
    };

    const onHide = () => {
      toggleContent(false);
    };

    return (
      <>
        {currentRoute === 'setupDetail' && (
          <NavButton onClick={onBack}>
            <Icon icon="arrow-left" size={24} />
          </NavButton>
        )}

        <NavButton id="robot-feature-close" onClick={onHide} right={true}>
          <Icon icon="times" size={17} />
        </NavButton>
        {content}
      </>
    );
  };

  renderProgress = () => {
    const percentage = this.getPercentage();

    let text = __('keep going!');

    if (percentage < 75 && percentage > 50) {
      text = __("you're halfway through, keep going!");
    }

    if (percentage > 75 && percentage < 100) {
      text = __('almost done, just a little more!');
    }

    if (percentage === 100) {
      text = __('awesome!');
    }

    return (
      <div>
        <ProgressBar percentage={percentage} color="#3B85F4" height="8px" />
        <ProgressText>
          {percentage}
          {__('% done -')} {text}
        </ProgressText>
      </div>
    );
  };

  renderFeature(feature: IFeature) {
    const { changeRoute } = this.props;

    this.setState({ selectedOption: feature }, () => {
      changeRoute('setupDetail');
    });
  }

  checkCondition(title?: string) {
    const { availableFeatures } = this.props;

    availableFeatures.map(availabeFeature => {
      if (availabeFeature.name === title) {
        this.renderFeature(availabeFeature);
      }

      return null;
    });
  }

  renderSetup() {
    const { roleValue } = this.props;

    const onRoleClick = (title?: string, gkey?: string) => {
      this.setState(
        {
          collapseKey: gkey
        },
        () => {
          this.checkCondition(title);
        }
      );
    };

    return (
      <SetupList>
        {ROLE_SETUP.map(group => (
          <CollapseContent
            key={group.key}
            id={group.key}
            title={__(group.title)}
            open={group.key === this.state.collapseKey ? true : false}
          >
            {group.content.map((content, index) => {
              if (content.types.includes(roleValue.value)) {
                return (
                  <Text
                    key={index}
                    onClick={onRoleClick.bind(this, content.title, group.key)}
                  >
                    <h6>{__(content.name)}</h6>
                    <p>
                      {content.steps} {__('steps')}
                    </p>
                  </Text>
                );
              }

              return null;
            })}
          </CollapseContent>
        ))}
      </SetupList>
    );
  }

  drawContent() {
    const { roleValue, restartRole, answerOf } = this.props;

    return (
      <>
        {this.headerGreeting()}
        {this.renderProgress()}

        <SubContent>
          <h5>
            {__(roleValue.label)} {__('Setup')}
          </h5>
        </SubContent>

        {this.renderSetup()}

        <RestartButton onClick={() => restartRole(roleValue, answerOf)}>
          {__('Reselect role')}
        </RestartButton>
      </>
    );
  }

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

  renderContent() {
    const { selectedOption } = this.state;
    const { currentRoute } = this.props;

    if (currentRoute === 'setupDetail') {
      return this.withHeader(
        selectedOption && <SetupDetail feature={selectedOption} />
      );
    }

    if (currentRoute === 'setupList') {
      return this.withHeader(this.drawContent());
    }

    return null;
  }

  render() {
    return <Container>{this.renderContent()}</Container>;
  }
}

export default Setup;
