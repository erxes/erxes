import { IUser } from 'modules/auth/types';
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
import Select from 'react-select-plus';

type Props = {
  onChange: (
    name: 'supporterIds' | 'messages',
    value: IMessages | string[]
  ) => void;
  teamMembers: IUser[];
  supporterIds?: string[];
  facebook?: string;
  twitter?: string;
  youtube?: string;
  languageCode: string;
  messages: IMessages;
};

type State = {
  supporters?: any;
  supporterIds: string[];
  facebook?: string;
  twitter?: string;
  youtube?: string;
  languageCode?: string;
  messages: IMessages;
};

class Intro extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { teamMembers, supporterIds = [], messages } = props;

    const selectedMembers: IUser[] = teamMembers.filter(member =>
      supporterIds.includes(member._id)
    );

    this.state = {
      supporters: this.generateSupporterOptions(selectedMembers),
      supporterIds: [],
      facebook: '',
      twitter: '',
      youtube: '',
      messages
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onTeamMembersChange = this.onTeamMembersChange.bind(this);
    this.onMessageChange = this.onMessageChange.bind(this);
    this.onGreetingsChange = this.onGreetingsChange.bind(this);
  }

  onInputChange<T extends keyof State>(name: any, value: State[T]) {
    this.setState({ [name]: value } as Pick<State, keyof State>);
    this.props.onChange(name, value);
  }

  onMessageChange(name, value) {
    const messages = { ...this.state.messages };

    messages[this.props.languageCode][name] = value;

    this.setState({ messages });

    this.props.onChange('messages', messages);
  }

  onGreetingsChange(name, value) {
    const messages = { ...this.state.messages };

    messages[this.props.languageCode].greetings[name] = value;

    this.setState({ messages });

    this.props.onChange('messages', messages);
  }

  onTeamMembersChange(options) {
    this.setState({
      supporters: options,
      supporterIds: options.map(option => option.value)
    });

    this.props.onChange('supporterIds', options.map(option => option.value));
  }

  generateSupporterOptions(members: IUser[] = []) {
    return members.map(member => {
      const details = member.details || {};

      return {
        value: member._id,
        label: details.fullName,
        avatar: details.avatar
      };
    });
  }

  render() {
    const { facebook, twitter, youtube, languageCode } = this.props;
    const message = this.state.messages[languageCode];

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Language</ControlLabel>

            <FormControl
              componentClass="select"
              id="languageCode"
              defaultValue={this.props.languageCode}
              onChange={(e: React.FormEvent<HTMLElement>) => {
                const target = e.currentTarget as HTMLInputElement;
                return this.onInputChange('languageCode', target.value);
              }}
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
              onChange={e =>
                this.onMessageChange(
                  'welcome',
                  (e.target as HTMLInputElement).value
                )
              }
            />
          </FormGroup>

          <SubHeading>{__('Greeting')}</SubHeading>

          <FormGroup>
            <ControlLabel>Greeting title</ControlLabel>

            <FormControl
              placeholder={__('Write here Greeting title.')}
              rows={3}
              value={message.greetings.title}
              onChange={e =>
                this.onGreetingsChange(
                  'title',
                  (e.target as HTMLInputElement).value
                )
              }
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Greeting message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Greeting message.')}
              rows={3}
              value={message.greetings.message}
              onChange={e =>
                this.onGreetingsChange(
                  'message',
                  (e.target as HTMLInputElement).value
                )
              }
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
              onChange={e =>
                this.onMessageChange(
                  'away',
                  (e.target as HTMLInputElement).value
                )
              }
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Thank you message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Thank you message.')}
              rows={3}
              value={message.thankyou}
              onChange={e =>
                this.onMessageChange(
                  'thankyou',
                  (e.target as HTMLInputElement).value
                )
              }
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Supporters</ControlLabel>

            <Select
              closeOnSelect={false}
              value={this.state.supporters}
              options={this.generateSupporterOptions(this.props.teamMembers)}
              onChange={this.onTeamMembersChange}
              clearable={true}
              multi
            />
          </FormGroup>

          <SubHeading>{__('Links')}</SubHeading>

          <FormGroup>
            <ControlLabel>Facebook</ControlLabel>

            <FormControl
              rows={3}
              value={facebook || ''}
              onChange={e => {
                this.onInputChange(
                  'facebook',
                  (e.target as HTMLInputElement).value
                );
              }}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Twitter</ControlLabel>

            <FormControl
              rows={3}
              value={twitter || ''}
              onChange={e => {
                this.onInputChange(
                  'twitter',
                  (e.target as HTMLInputElement).value
                );
              }}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Youtube</ControlLabel>

            <FormControl
              rows={3}
              value={youtube || ''}
              onChange={e => {
                this.onInputChange(
                  'youtube',
                  (e.target as HTMLInputElement).value
                );
              }}
            />
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Intro;
