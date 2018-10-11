import { IUser } from 'modules/auth/types';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { SubHeading } from 'modules/settings/styles';
import * as React from 'react';
import Select from 'react-select-plus';

type Props = {
  onChange: (
    name: 'supporterIds' | 'welcomeMessage' | 'awayMessage' | 'thankYouMessage',
    value: string | string[]
  ) => void;
  teamMembers: IUser[];
  supporterIds?: string[];
  welcomeMessage?: string;
  awayMessage?: string;
  greetingMessage?: string;
  greetingTitle?: string;
  thankYouMessage?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  languageCode?: string;
};

type State = {
  supporters?: any;
  supporterIds: string[];
  welcomeMessage: string;
  awayMessage: string;
  thankYouMessage: string;
  greetingMessage: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  languageCode?: string;
};

class Intro extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { teamMembers, supporterIds = [] } = props;

    const selectedMembers: IUser[] = teamMembers.filter(member =>
      supporterIds.includes(member._id)
    );

    this.state = {
      supporters: this.generateSupporterOptions(selectedMembers),
      supporterIds: [],
      welcomeMessage: '',
      awayMessage: '',
      thankYouMessage: '',
      greetingMessage: '',
      facebook: '',
      twitter: '',
      youtube: ''
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onTeamMembersChange = this.onTeamMembersChange.bind(this);
  }

  onInputChange<T extends keyof State>(name: any, value: State[T]) {
    this.setState({ [name]: value } as Pick<State, keyof State>);
    this.props.onChange(name, value);
  }

  onTeamMembersChange(options) {
    if (options.length < 3) {
      this.setState({
        supporters: options,
        supporterIds: options.map(option => option.value)
      });
      this.props.onChange('supporterIds', options.map(option => option.value));
    }
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
    const { facebook, twitter, youtube } = this.props;

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
              <option value="mn">Монгол</option>
              <option value="en">English</option>
            </FormControl>
          </FormGroup>

          <SubHeading>{__('Online messaging')}</SubHeading>

          <FormGroup>
            <ControlLabel>Welcome message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Welcome message.')}
              rows={3}
              value={this.props.welcomeMessage}
              onChange={e =>
                this.onInputChange(
                  'welcomeMessage',
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
              value={this.props.greetingTitle}
              onChange={e =>
                this.onInputChange(
                  'greetingTitle',
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
              value={this.props.greetingMessage}
              onChange={e =>
                this.onInputChange(
                  'greetingMessage',
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
              value={this.props.awayMessage}
              onChange={e =>
                this.onInputChange(
                  'awayMessage',
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
              value={this.props.thankYouMessage}
              onChange={e =>
                this.onInputChange(
                  'thankYouMessage',
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
