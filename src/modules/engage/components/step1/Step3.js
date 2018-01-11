import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Step,
  Header,
  HeaderNumber,
  HeaderTitle,
  Content,
  FinishedStep,
  FlexItem,
  ContentCenter,
  Divider
} from './Style';
import EmailForm from '../EmailForm';
import MessengerForm from '../MessengerForm';

const propTypes = {
  finished: PropTypes.bool,
  message: PropTypes.object,
  brands: PropTypes.array,
  templates: PropTypes.array,
  onEmailContentChange: PropTypes.func,
  onMessengerContentChange: PropTypes.func,
  changeStep: PropTypes.func,
  fromUser: PropTypes.string
};

class Step3 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.finished !== false) {
      if (this.context.method === 'email') {
        return (
          <Step>
            <Header>
              <HeaderNumber>3</HeaderNumber>
              <HeaderTitle>Text a message</HeaderTitle>
            </Header>
            <Content>
              <EmailForm
                message={this.props.message}
                templates={this.props.templates}
                onContentChange={this.props.onEmailContentChange}
              />
            </Content>
          </Step>
        );
      }
      return (
        <Step>
          <Header>
            <HeaderNumber>3</HeaderNumber>
            <HeaderTitle>Text a message</HeaderTitle>
          </Header>
          <Content>
            <MessengerForm
              showMessengerType
              message={this.props.message}
              fromUser={this.props.fromUser}
              onContentChange={this.props.onMessengerContentChange}
              brands={this.props.brands}
            />
          </Content>
        </Step>
      );
    }
    return (
      <FinishedStep onClick={() => this.props.changeStep(3)}>
        <Header>
          <HeaderNumber>3</HeaderNumber>
        </Header>
      </FinishedStep>
    );
  }
}

Step3.contextTypes = {
  method: PropTypes.string
};

Step3.propTypes = propTypes;

export default Step3;
