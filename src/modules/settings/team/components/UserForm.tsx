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
import { IUser } from '../../../auth/types';
import { IChannel } from '../../channels/types';
import { ICommonFormProps } from '../../common/types';

type Props = {
  object?: IUser,
  channels: IChannel[],
};

type State = {
  avatar: string,
  selectedChannels: IChannel[],
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

  generateDoc() {
     return {
      username: (document.getElementById('username') as HTMLInputElement).value,
      email: (document.getElementById('email') as HTMLInputElement).value,
      role: (document.getElementById('role') as HTMLInputElement).value,
      details: {
        avatar: this.state.avatar,
        position: (document.getElementById('position') as HTMLInputElement).value,
        fullName: (document.getElementById('fullName') as HTMLInputElement).value,
        location: (document.getElementById('user-location') as HTMLInputElement).value,
        description: (document.getElementById('description') as HTMLInputElement).value,
      },
      channelIds: this.collectValues(this.state.selectedChannels),
      password: (document.getElementById('password') as HTMLInputElement).value,
      passwordConfirmation: (document.getElementById('password-confirmation') as HTMLInputElement).value,
      links: {
        linkedIn: (document.getElementById('linkedin') as HTMLInputElement).value,
        twitter: (document.getElementById('twitter') as HTMLInputElement).value,
        facebook: (document.getElementById('facebook') as HTMLInputElement).value,
        youtube: (document.getElementById('youtube') as HTMLInputElement).value,
        github: (document.getElementById('github') as HTMLInputElement).value,
        website: (document.getElementById('website') as HTMLInputElement).value
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
