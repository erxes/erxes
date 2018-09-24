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

type Props= {
  onChange: (name: 'supporterIds' | 'welcomeMessage' | 'awayMessage' | 'thankYouMessage', value: string | string[]) => void;
  teamMembers: IUser[];
  supporterIds?: string[];
  welcomeMessage?: string;
  awayMessage?: string;
  thankYouMessage?: string;
};

type State = {
  supporters?: any;
  supporterIds: string[];
  welcomeMessage: string;
  awayMessage: string;
  thankYouMessage: string;
}

class Intro extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { teamMembers, supporterIds=[] } = props;

    const selectedMembers: IUser[] = teamMembers.filter(member =>
      supporterIds.includes(member._id)
    );

    this.state = {
      supporters: this.generateSupporterOptions(selectedMembers),
      supporterIds: [],
      welcomeMessage: '',
      awayMessage: '',
      thankYouMessage: ''
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
      }
    });
  }

  render() {
    return (
      <FlexItem>
        <LeftItem>
          <SubHeading>{__('Online messaging')}</SubHeading>

          <FormGroup>
            <ControlLabel>Welcome message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Welcome message.')}
              rows={3}
              value={this.props.welcomeMessage}
              onChange={(e: React.FormEvent<HTMLElement>) => 
                this.onInputChange('welcomeMessage', (e.target as HTMLInputElement).value)}
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
              onChange={(e: React.FormEvent<HTMLElement>) => 
                this.onInputChange('awayMessage', (e.target as HTMLInputElement).value)}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Thank you message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Thank you message.')}
              rows={3}
              value={this.props.thankYouMessage}
              onChange={(e: React.FormEvent<HTMLElement>) => 
                this.onInputChange('thankYouMessage', (e.target as HTMLInputElement).value)}
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
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Intro;
