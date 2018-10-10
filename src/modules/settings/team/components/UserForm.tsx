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
import { Form as CommonForm } from '../../common/components';
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
    this.renderContent = this.renderContent.bind(this);
    this.generateDoc = this.generateDoc.bind(this);

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
      label: channel.name,
      value: channel._id
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
    const doc = {
      channelIds: this.collectValues(this.state.selectedChannels),
      details: {
        avatar: this.state.avatar,
        description: this.getInputElementValue('description'),
        fullName: this.getInputElementValue('fullName'),
        location: this.getInputElementValue('user-location'),
        position: this.getInputElementValue('position')
      },
      email: this.getInputElementValue('email'),
      links: {
        facebook: this.getInputElementValue('facebook'),
        github: this.getInputElementValue('github'),
        linkedIn: this.getInputElementValue('linkedin'),
        twitter: this.getInputElementValue('twitter'),
        website: this.getInputElementValue('website'),
        youtube: this.getInputElementValue('youtube')
      },
      password: this.getInputElementValue('password'),
      passwordConfirmation: this.getInputElementValue('password-confirmation'),
      role: this.getInputElementValue('role'),
      username: this.getInputElementValue('username')
    };

    return { doc };
  }

  renderContent() {
    const { object } = this.props;
    const user = object || { details: {} };

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

  render() {
    return (
      <CommonForm
        {...this.props}
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
      />
    );
  }
}

export default UserForm;
