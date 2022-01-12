import { IUser } from 'modules/auth/types';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { IMessages } from 'modules/settings/integrations/types';
import { SubHeading } from 'modules/settings/styles';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';

type Props = {
  onChange: (name: any, value: any) => void;
  teamMembers: IUser[];
  supporterIds: string[];
  facebook?: string;
  twitter?: string;
  youtube?: string;
  languageCode: string;
  messages: IMessages;
};

type State = {
  facebook?: string;
  twitter?: string;
  youtube?: string;
  languageCode?: string;
  messages: IMessages;
};

class Greeting extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { messages } = props;

    this.state = {
      facebook: '',
      twitter: '',
      youtube: '',
      messages
    };
  }

  onInputChange = <T extends keyof State>(name: any, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
    this.props.onChange(name, value);
  };

  onGreetingsChange = (name, value) => {
    const messages = { ...this.state.messages };

    messages[this.props.languageCode].greetings[name] = value;

    this.setState({ messages });

    this.props.onChange('messages', messages);
  };

  render() {
    const {
      facebook,
      twitter,
      youtube,
      languageCode,
      supporterIds
    } = this.props;
    const message = this.state.messages[languageCode] || {
      greetings: {
        title: '',
        message: ''
      }
    };

    const greetingTitle = e =>
      this.onGreetingsChange('title', (e.target as HTMLInputElement).value);

    const greetingMessage = e =>
      this.onGreetingsChange('message', (e.target as HTMLInputElement).value);

    const facebookChange = e =>
      this.onInputChange('facebook', (e.target as HTMLInputElement).value);

    const twitterChange = e =>
      this.onInputChange('twitter', (e.target as HTMLInputElement).value);

    const youtubeChange = e =>
      this.onInputChange('youtube', (e.target as HTMLInputElement).value);

    const usersOnChange = users => this.props.onChange('supporterIds', users);

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Greeting title</ControlLabel>

            <FormControl
              placeholder={__('Write here Greeting title') + '.'}
              rows={3}
              value={message.greetings.title}
              onChange={greetingTitle}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Greeting message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Greeting message') + '.'}
              rows={3}
              value={message.greetings.message}
              onChange={greetingMessage}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Supporters</ControlLabel>

            <SelectTeamMembers
              label="Choose users"
              name="supporterIds"
              initialValue={supporterIds}
              onSelect={usersOnChange}
            />
          </FormGroup>

          <SubHeading>{__('Links')}</SubHeading>

          <FormGroup>
            <ControlLabel>Facebook</ControlLabel>

            <FormControl
              rows={3}
              value={facebook || ''}
              onChange={facebookChange}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Twitter</ControlLabel>

            <FormControl
              rows={3}
              value={twitter || ''}
              onChange={twitterChange}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Youtube</ControlLabel>

            <FormControl
              rows={3}
              value={youtube || ''}
              onChange={youtubeChange}
            />
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Greeting;
