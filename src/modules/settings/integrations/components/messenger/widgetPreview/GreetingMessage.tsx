import { __ } from 'modules/common/utils';
import { IMessagesItem } from 'modules/settings/integrations/types';
import * as React from 'react';
import { GreetingInfo } from './styles';

type Props = {
  message?: IMessagesItem;
};

class GreetingMessage extends React.PureComponent<Props> {
  renderGreetingTitle() {
    const { message } = this.props;

    if (message && message.greetings.title) {
      return <h3>{message.greetings.title}</h3>;
    }

    return <h3>{__('Welcome')}</h3>;
  }

  renderGreetingMessage() {
    const { message } = this.props;

    if (message && message.greetings.message) {
      return <p>{message.greetings.message}</p>;
    }

    return (
      <p>
        {__('Hi, any questions?')} <br /> {__('We`re ready to help you.')}
      </p>
    );
  }

  render() {
    return (
      <GreetingInfo>
        {this.renderGreetingTitle()}
        {this.renderGreetingMessage()}
      </GreetingInfo>
    );
  }
}

export default GreetingMessage;
