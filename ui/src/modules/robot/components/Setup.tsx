import CollapseContent from 'modules/common/components/CollapseContent';
import { __ } from 'modules/common/utils';
import { ROLE_SETUP } from 'modules/robot/constants';
import { IFeature, IRoleValue } from 'modules/robot/types';
import ProgressBar from 'modules/common/components/ProgressBar';
import React from 'react';
import styled from 'styled-components';
import {
  Container,
  Greeting,
  NavButton,
  SetupList,
  SubContent,
  ProgressText
} from './styles';
import colors from 'modules/common/styles/colors';
import dimensions from 'modules/common/styles/dimensions';
import { calculatePercentage, getCurrentUserName } from 'modules/robot/utils';
import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import SetupDetail from '../containers/SetupDetail';

const Text = styled.div`
  font-weight: normal;
  background: ${colors.colorWhite};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;

  &:hover {
    cursor: pointer;
  }

  h6 {
    margin: 0px;
    width: 80%;
  }

  p {
    margin: 0px;
    font-size: 11px;
    background-color: #673fbd;
    color: white;
    padding: 2px 5px 2px;
    border-radius: ${dimensions.unitSpacing}px;
  }
`;

type Props = {
  roleSetupOptions: IFeature[];
  currentRoute?: string;
  changeRoute: (route: string) => void;
  roleValue: IRoleValue;
  currentUser: IUser;
  showContent: boolean;
  toggleContent: (isShow: boolean) => void;
};

type State = { selectedOptions?: IFeature; showComplete: boolean };

class Setup extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { selectedOptions: undefined, showComplete: true };
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

  renderSetup(roleOption?: IFeature) {
    const { changeRoute, roleValue } = this.props;

    const onClick = () => {
      this.setState({ selectedOptions: roleOption }, () => {
        changeRoute('setupDetail');
      });
    };

    return (
      <SetupList>
        {ROLE_SETUP.map(group => (
          <CollapseContent
            key={group.key}
            id={group.key}
            title={__(group.title)}
          >
            {group.content.map((content, index) => {
              if (content.types.includes(roleValue.value)) {
                return (
                  <Text key={index} onClick={onClick}>
                    <h6>{content.name}</h6>
                    <p>{content.steps}</p>
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

  renderContent() {
    const { selectedOptions } = this.state;
    const { currentRoute, currentUser, roleValue } = this.props;

    if (currentRoute === 'setupDetail') {
      return this.withHeader(
        selectedOptions && <SetupDetail feature={selectedOptions} />
      );
    }

    if (currentRoute === 'setupList') {
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

          <SubContent>
            <h4>
              {roleValue.label} {__('Setup')}
            </h4>
          </SubContent>

          {this.renderSetup()}
        </>
      );
    }
    return null;
  }

  toggleFeatures = () => {
    this.setState({ showComplete: !this.state.showComplete });
  };

  getPercentage() {
    const { roleSetupOptions } = this.props;
    const completedCount = roleSetupOptions.filter(
      feature => feature.isComplete
    ).length;

    return calculatePercentage(roleSetupOptions.length + 1, completedCount + 1);
  }

  render() {
    return <Container>{this.renderContent()}</Container>;
  }
}

export default Setup;
