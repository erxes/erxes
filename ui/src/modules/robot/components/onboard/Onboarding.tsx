import Button from 'modules/common/components/Button';
import CommonPortal from 'modules/common/components/CommonPortal';
import Icon from 'modules/common/components/Icon';
import * as React from 'react';
import styled from 'styled-components';
import { BackDrop } from '../styles';
import Customization from './Customization';
import Indicator from './Indicator';
import Welcome from './Welcome';

const Wrapper = styled.div`
  margin: 0;
  position: relative;

  h3 {
    margin: 10px 0 20px;
    font-size: 22px;
  }

  p {
    margin-bottom: 10px;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  height: 34px;
  margin-top: 20px;
  padding-left: 16px;
`;

const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;

type Props = {
  onClick?: () => void;
  currentUserName: string;
  changeRoute: (route: string) => void;
  activeStep?: number;
};

type State = {
  activeStep: number;
};

class Onboarding extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = { activeStep: props.activeStep || 0 };
  }

  changeStep = () => {
    const { activeStep } = this.state;
    this.setState({ activeStep: activeStep === 1 ? 0 : activeStep + 1 });
  };

  renderButton = (text: string, onClick, icon: string, disabled?: boolean) => {
    const handleClick = () => {
      this.changeStep();
      onClick();
    };

    return (
      <ButtonWrapper>
        <Button
          uppercase={false}
          onClick={handleClick}
          btnStyle="primary"
          disabled={disabled}
        >
          {text} <Icon icon={icon} />
        </Button>
      </ButtonWrapper>
    );
  };

  renderContent = () => {
    if (this.state.activeStep === 0) {
      const { currentUserName } = this.props;

      return (
        <Welcome
          changeStep={this.changeStep}
          currentUserName={currentUserName}
          renderButton={this.renderButton}
        />
      );
    }

    return (
      <Customization
        changeRoute={this.props.changeRoute}
        renderButton={this.renderButton}
      />
    );
  };

  render() {
    return (
      <Wrapper>
        {this.renderContent()}
        <Footer>
          <Indicator totalStep={2} activeStep={this.state.activeStep} />
        </Footer>
        <CommonPortal>
          <BackDrop />
        </CommonPortal>
      </Wrapper>
    );
  }
}

export default Onboarding;
