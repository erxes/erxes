import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import BuildSkill from 'modules/settings/integrations/containers/messenger/BuildSkill';
import { IMessages, ISkillData } from 'modules/settings/integrations/types';
import { SubHeading } from 'modules/settings/styles';
import React from 'react';

type Props = {
  skillData?: ISkillData;
  onChange: (
    name: 'supporterIds' | 'messages',
    value: IMessages | string[]
  ) => void;
  languageCode: string;
  messages: IMessages;
};

type State = {
  messages: IMessages;
};

class Intro extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { messages } = props;

    this.state = {
      messages
    };
  }

  onMessageChange = (name, value) => {
    const messages = { ...this.state.messages };

    messages[this.props.languageCode][name] = value;

    this.setState({ messages });

    this.props.onChange('messages', messages);
  };

  render() {
    const { languageCode, skillData } = this.props;
    const message = this.state.messages[languageCode] || {};

    const welcomeOnChange = e =>
      this.onMessageChange('welcome', (e.target as HTMLInputElement).value);

    const awayMessage = e =>
      this.onMessageChange('away', (e.target as HTMLInputElement).value);

    const thankMessage = e =>
      this.onMessageChange('thank', (e.target as HTMLInputElement).value);

    return (
      <FlexItem>
        <LeftItem>
          <SubHeading>{__('Online messaging')}</SubHeading>

          <FormGroup>
            <ControlLabel>Welcome message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Welcome message') + '.'}
              rows={3}
              value={message.welcome}
              onChange={welcomeOnChange}
            />
          </FormGroup>

          <SubHeading>{__('Offline messaging')}</SubHeading>

          <FormGroup>
            <ControlLabel>Away message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Away message') + '.'}
              rows={3}
              value={message.away}
              onChange={awayMessage}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Thank you message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Thank you message') + '.'}
              rows={3}
              value={message.thank}
              onChange={thankMessage}
            />
          </FormGroup>

          <FormGroup>
            <BuildSkill skillData={skillData} onChange={this.props.onChange} />
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Intro;
