import { IUser } from 'modules/auth/types';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { SubHeading } from 'modules/settings/styles';
import React, { Component } from 'react';
import Select from 'react-select-plus';

type Props= {
  onChange: (name: string, value: string) => void,
  teamMembers: IUser[],
  supporterIds?: string[],
  welcomeMessage?: string,
  awayMessage?: string,
  thankYouMessage?: string
};

type State = {
  supporters?: any,
  supporterIds: string[]
}

class Intro extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { teamMembers, supporterIds=[] } = props;

    const selectedMembers: IUser[] = teamMembers.filter(member =>
      supporterIds.includes(member._id)
    );

    this.state = {
      supporters: this.generateSupporterOptions(selectedMembers),
      supporterIds: []
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.onTeamMembersChange = this.onTeamMembersChange.bind(this);
  }

  onInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
    this.props.onChange(e.target.name, e.target.value);
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
              placeholder={__('Write here Welcome message.').toString()}
              rows={3}
              name="welcomeMessage"
              value={this.props.welcomeMessage}
              onChange={this.onInputChange}
            />
          </FormGroup>

          <SubHeading>{__('Offline messaging')}</SubHeading>

          <FormGroup>
            <ControlLabel>Away message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Away message.').toString()}
              rows={3}
              name="awayMessage"
              value={this.props.awayMessage}
              onChange={this.onInputChange}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Thank you message</ControlLabel>

            <FormControl
              componentClass="textarea"
              placeholder={__('Write here Thank you message.').toString()}
              rows={3}
              name="thankYouMessage"
              value={this.props.thankYouMessage}
              onChange={this.onInputChange}
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
