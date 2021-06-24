import CollapseContent from 'modules/common/components/CollapseContent';
import { __ } from 'modules/common/utils';
import { ROLE_SETUP, ROLE_SETUP_DETAILS } from 'modules/robot/constants';
import { IFeature, IRoleValue } from 'modules/robot/types';
import React from 'react';
import styled from 'styled-components';
import {
  Container,
  Greeting,
  NavButton,
  ProgressText,
  RestartButton,
  SetupList,
  SubContent
} from './styles';
import dimensions from 'modules/common/styles/dimensions';
import { getCurrentUserName } from 'modules/robot/utils';
import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import SetupDetail from '../containers/SetupDetail';
import ProgressBar from 'modules/common/components/ProgressBar';

const Text = styled.div`
  font-weight: normal;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #eee;
  border-top: none;

  &:hover {
    cursor: pointer;
  }

  h6 {
    margin: 0px;
    font-weight: 400;
    width: 80%;
  }

  p {
    margin: 0px;
    font-size: 11px;
    background-color: rgba(101, 105, 223, 0.8);
    color: white;
    padding: 2px 5px 2px;
    border-radius: ${dimensions.unitSpacing}px;
  }
`;

type Props = {
  currentRoute?: string;
  changeRoute: (route: string) => void;
  roleValue: IRoleValue;
  currentUser: IUser;
  showContent: boolean;
  toggleContent: (isShow: boolean) => void;
  restartRole: (role: string) => void;
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
      showComplete: true,
      collapseKey: ''
    };
  }

  onRoleClick = (title?: string, gkey?: string) => {
    this.setState(
      {
        selectedOption: title ? ROLE_SETUP_DETAILS[title] : {},
        collapseKey: gkey
      },
      () => {
        this.props.changeRoute('setupDetail');
      }
    );
  };

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

  openCollapse(gkey: string): boolean {
    if (gkey === this.state.collapseKey) {
      return true;
    }
    return false;
  }

  renderSetup() {
    const { roleValue } = this.props;

    return (
      <SetupList>
        {ROLE_SETUP.map(group => (
          <CollapseContent
            key={group.key}
            id={group.key}
            title={__(group.title)}
            open={this.openCollapse(group.key)}
          >
            {group.content.map((content, index) => {
              if (content.types.includes(roleValue.value)) {
                return (
                  <Text
                    key={index}
                    onClick={this.onRoleClick.bind(
                      this,
                      content.title,
                      group.key
                    )}
                  >
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

  getPercentage() {
    const min = 0;
    const max = 100;
    const percentage = Math.floor(min + Math.random() * (max - min));
    return percentage;
  }

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

  drawContent() {
    return;
  }

  renderContent() {
    const { selectedOption } = this.state;
    const { currentRoute, currentUser, roleValue, restartRole } = this.props;
    const percentage = this.getPercentage();

    if (currentRoute === 'setupDetail') {
      return this.withHeader(
        selectedOption && <SetupDetail roleOption={selectedOption} />
      );
    }

    if (currentRoute === 'setupList') {
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
          </Greeting>

          {this.renderProgress()}

          <SubContent>
            <h5>
              {roleValue.label} {__('Setup')}
            </h5>
          </SubContent>

          {this.renderSetup()}

          <RestartButton onClick={() => restartRole(roleValue.value)}>
            {__('Reselect role')}
          </RestartButton>
        </>
      );
    }

    return null;
  }

  render() {
    return <Container>{this.renderContent()}</Container>;
  }
}

export default Setup;
