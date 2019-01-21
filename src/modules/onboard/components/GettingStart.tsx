import * as React from 'react';
import * as RTG from 'react-transition-group';
import { STEPS } from '../constants';
import { Content } from './';
import {
  ContentContainer,
  Header,
  Indicator,
  Item,
  LeftContent,
  MainContainer,
  RightContent
} from './styles';

type Props = {
  onSuccess: (password: string) => void;
  closeModal: () => void;
};

type State = {
  activeStep: number;
};

class GettingStart extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      activeStep: 1
    };

    this.changeStep = this.changeStep.bind(this);
  }

  changeStep(increase: boolean = true) {
    const { activeStep } = this.state;

    if (increase) {
      return this.setState({ activeStep: activeStep + 1 });
    }

    return this.setState({ activeStep: activeStep - 1 });
  }

  goStep(activeStep: number) {
    this.setState({ activeStep });
  }

  render() {
    const { activeStep } = this.state;

    return (
      <MainContainer>
        <Header>
          <img src="/images/logo-dark.png" alt="erxes" />
        </Header>

        <ContentContainer>
          <LeftContent>
            <Content activeStep={activeStep} changeStep={this.changeStep} />
          </LeftContent>

          <RightContent>
            <RTG.CSSTransition
              in={true}
              appear={true}
              timeout={500}
              classNames="move"
            >
              <Indicator>
                {STEPS.map((step, index) => (
                  <Item
                    key={index}
                    data-number={index + 1}
                    active={index + 1 === activeStep}
                    onClick={this.goStep.bind(this, index + 1)}
                  >
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </Item>
                ))}
              </Indicator>
            </RTG.CSSTransition>
          </RightContent>
        </ContentContainer>
      </MainContainer>
    );
  }
}

export default GettingStart;
