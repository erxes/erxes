import { UserCommonInfos } from 'modules/auth/components';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ColumnTitle } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import Select from 'react-select-plus';
import { IChannel } from '../../channels/types';
import { ICommonFormProps } from '../../common/types';

type Props = {
  channels: IChannel[];
};

type State = {
  avatar: string;
  selectedChannels: IChannel[];
};

class UserForm extends React.Component<Props & ICommonFormProps, State> {
  constructor(props) {
    super(props);

    this.onAvatarUpload = this.onAvatarUpload.bind(this);
    this.generateChannelsParams = this.generateChannelsParams.bind(this);
    this.collectValues = this.collectValues.bind(this);

    const user = props.object || { details: {} };
    const defaultAvatar = '/images/avatar-colored.svg';

    this.state = {
      avatar: user.details.avatar || defaultAvatar,
      selectedChannels: this.generateChannelsParams(props.selectedChannels)
    };
  }

  onAvatarUpload(url) {
    this.setState({ avatar: url });
  }

  generateChannelsParams(channels) {
    return channels.map(channel => ({
      value: channel._id,
      label: channel.name
    }));
  }

  collectValues(items) {
    return items.map(item => item.value);
  }

  renderChannels() {
    const self = this;
    const { channels } = this.props;

    return (
      <FormGroup>
        <ControlLabel>Choose the channels</ControlLabel>
        <br />

        <Select
          placeholder={__('Choose channels')}
          value={self.state.selectedChannels}
          options={self.generateChannelsParams(channels)}
          onChange={items => {
            self.setState({ selectedChannels: items });
          }}
          multi
        />
      </FormGroup>
    );
  }

  getInputElementValue(id) {
    return (document.getElementById(id) as HTMLInputElement).value;
  }

  generateDoc() {
     return {
      username: this.getInputElementValue('username'),
      email: this.getInputElementValue('email'),
      role: this.getInputElementValue('role'),
      details: {
        avatar: this.state.avatar,
        position: this.getInputElementValue('position'),
        fullName: this.getInputElementValue('fullName'),
        location: this.getInputElementValue('user-location'),
        description: this.getInputElementValue('description'),
      },
      channelIds: this.collectValues(this.state.selectedChannels),
      password: this.getInputElementValue('password'),
      passwordConfirmation: this.getInputElementValue('password-confirmation'),
      links: {
        linkedIn: this.getInputElementValue('linkedin'),
        twitter: this.getInputElementValue('twitter'),
        facebook: this.getInputElementValue('facebook'),
        youtube: this.getInputElementValue('youtube'),
        github: this.getInputElementValue('github'),
        website: this.getInputElementValue('website')
      }
     }
  }

  renderContent(object) {
    const user = object._id ? object : { details: {} };

    return (
      <div>
        <UserCommonInfos user={user} onAvatarUpload={this.onAvatarUpload} />
        <ColumnTitle>{__('Other')}</ColumnTitle>
        <FormGroup>
          <ControlLabel>Role</ControlLabel>

          <FormControl
            componentClass="select"
            defaultValue={user.role}
            id="role"
          >
            <option value="admin">{__('Admin')}</option>
            <option value="contributor">{__('Contributor')}</option>
          </FormControl>
        </FormGroup>

        {this.renderChannels()}

        <br />

        <FormGroup>
          <ControlLabel>Password</ControlLabel>
          <FormControl id="password" type="password" />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Password confirmation</ControlLabel>
          <FormControl id="password-confirmation" type="password" />
        </FormGroup>
      </div>
    );
  }
}

export default UserForm;
