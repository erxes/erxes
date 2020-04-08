import Button from 'modules/common/components/Button';
import CommonPortal from 'modules/common/components/CommonPortal';
import * as React from 'react';
import styled from 'styled-components';
import Customization from './Customization';
import Indicator from './Indicator';
import { BackDrop } from './styles';

const Wrapper = styled.div`
  width: 280px;
  margin: 0;
  transition: 0.3s height ease;
  position: relative;

  img {
    width: 100%;
    margin-bottom: 30px;
  }

  h3 {
    margin: 10px 0 20px;
    font-size: 24px;
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
`;

const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;

type Props = {
  onClick?: () => void;
  currentUserName: string;
};

type State = {
  activeStep: number;
};

class Welcome extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = { activeStep: 1 };
  }

  changeStep = () => {
    const { activeStep } = this.state;
    this.setState({ activeStep: activeStep === 1 ? 0 : activeStep + 1 });
  };

  renderButton = (text: string, onClick) => {
    const handleClick = () => {
      this.changeStep();
      onClick();
    };

    return (
      <ButtonWrapper>
        <Button uppercase={false} onClick={handleClick}>
          {text}
        </Button>
      </ButtonWrapper>
    );
  };

  renderContent = () => {
    if (this.state.activeStep === 0) {
      const { currentUserName } = this.props;

      return (
        <>
          <img alt="welcome" src="/images/actions/welcome.svg" />
          <div>
            <h3>
              Welcome, <b>{currentUserName}</b>
            </h3>
            <p>
              We're thrilled to have you on board and can't wait to see you set
              up your business here already.
            </p>
          </div>
          {this.renderButton('Get Started', this.changeStep)}
        </>
      );
    }

    return <Customization renderButton={this.renderButton} />;
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

export default Welcome;
