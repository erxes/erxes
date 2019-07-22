import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import RTG from 'react-transition-group';
import { STEPS } from '../constants';
import Content from './Content';
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

class GettingStart extends React.PureComponent<Props> {
  renderInfo = information => {
    if (!information) {
      return null;
    }

    return (
      <Tip text={__(information)}>
        <span>
          <Icon icon="information" />
        </span>
      </Tip>
    );
  };

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
                    <h4>
                      {__(step.title)} {this.renderInfo(step.information)}
                    </h4>
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
