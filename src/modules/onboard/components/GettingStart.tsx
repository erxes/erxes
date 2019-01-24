import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Link } from 'react-router-dom';
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
  activeStep: number;
  goStep: (step: number) => void;
};

type State = {
  activeStep: number;
};

class GettingStart extends React.PureComponent<Props, State> {
  render() {
    const { activeStep, goStep } = this.props;

    return (
      <MainContainer>
        <Header>
          <img src="/images/logo-dark.png" alt="erxes" />
          <Link to="/">{__('Skip')} »</Link>
        </Header>

        <ContentContainer>
          <LeftContent>
            <Content activeStep={activeStep} />
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
                    onClick={goStep.bind(this, index + 1)}
                  >
                    <h4>{__(step.title)}</h4>
                    <p>{__(step.description)}</p>
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
