import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step,
  Header,
  HeaderNumber,
  NextButton,
  ContentCenter,
  ButtonBox,
  FinishedStep,
  Flex
} from './Style';
import { Icon } from 'modules/common/components';

const propTypes = {
  finished: PropTypes.bool,
  changeMethod: PropTypes.func,
  changeStep: PropTypes.func
};

class Step1 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.finished !== false) {
      return (
        <Step>
          <Header>
            <HeaderNumber>1</HeaderNumber>
            <span>Choose template</span>
            <NextButton>
              <span>Next</span>
              <Icon icon="ios-arrow-forward" />
            </NextButton>
          </Header>
          <ContentCenter>
            <Flex>
              <ButtonBox
                selected={this.context.method === 'email'}
                onClick={() => this.props.changeMethod('email')}
              >
                <span>Email</span>
                <p>
                  Delivered to a user s email inbox <br />Customize with your
                  own templates
                </p>
              </ButtonBox>

              <ButtonBox
                selected={this.context.method === 'messenger'}
                onClick={() => this.props.changeMethod('messenger')}
              >
                <span>Messenger</span>
                <p>
                  Delivered inside your app<br />Reach active users
                </p>
              </ButtonBox>
            </Flex>
          </ContentCenter>
        </Step>
      );
    }
    return (
      <FinishedStep onClick={() => this.props.changeStep(1)}>
        <Header>
          <HeaderNumber>1</HeaderNumber>
        </Header>
      </FinishedStep>
    );
  }
}

Step1.contextTypes = {
  method: PropTypes.string
};

Step1.propTypes = propTypes;

export default Step1;
