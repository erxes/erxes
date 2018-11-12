import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { LANGUAGES } from 'modules/settings/general/constants';
import { IMessages } from 'modules/settings/integrations/types';
import { SubHeading } from 'modules/settings/styles';
import * as React from 'react';

type Props = {
  onChange: (
    name: 'supporterIds' | 'messages',
    value: IMessages | string[]
  ) => void;
  languageCode: string;
  messages: IMessages;
};

type State = {
  supporters?: any;
  languageCode?: string;
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

  onInputChange = <T extends keyof State>(name: any, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
    this.props.onChange(name, value);
  };

  onMessageChange = (name, value) => {
    const messages = { ...this.state.messages };

    messages[this.props.languageCode][name] = value;

    this.setState({ messages });

    this.props.onChange('messages', messages);
  };

  render() {
    const { languageCode } = this.props;
    const message = this.state.messages[languageCode];

    const languageOnChange = e =>
      this.onInputChange(
        'languageCode',
        (e.currentTarget as HTMLInputElement).value
      );

    const welcomeOnChange = e =>
      this.onMessageChange('welcome', (e.target as HTMLInputElement).value);

    const awayMessage = e =>
      this.onMessageChange('away', (e.target as HTMLInputElement).value);

    const thankMessage = e =>
      this.onMessageChange('thank', (e.target as HTMLInputElement).value);

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Language</ControlLabel>

            <FormControl
              componentClass="select"
              id="languageCode"
              defaultValue={this.props.languageCode}
              onChange={languageOnChange}
            >
              <option />
              {LANGUAGES.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <SubHeading>{__('Online messaging')}</SubHeading>

          <FormGroup>
            <ControlLabel>Welcome message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Welcome message.')}
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
              placeholder={__('Write here Away message.')}
              rows={3}
              value={message.away}
              onChange={awayMessage}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Thank you message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Thank you message.')}
              rows={3}
              value={message.thank}
              onChange={thankMessage}
            />
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Intro;
