import { UserCommonInfos } from 'modules/auth/components';
import { IUser, IUserDetails, IUserLinks } from 'modules/auth/types';
import { ControlLabel, FormGroup } from 'modules/common/components';
import { ColumnTitle } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { IUserGroup } from 'modules/settings/permissions/types';
import React from 'react';
import Select from 'react-select-plus';
import { IChannel } from '../../channels/types';
import { Form as CommonForm } from '../../common/components';
import { ICommonFormProps } from '../../common/types';

type Props = {
  channels: IChannel[];
  groups: any;
  selectedChannels: IChannel[];
  selectedGroups: IUserGroup[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
} & ICommonFormProps;

type State = {
  avatar: string;
  selectedChannels: IChannel[];
  selectedGroups: IUserGroup[];
};

class UserForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const user = props.object || { details: {} };
    const defaultAvatar = '/images/avatar-colored.svg';

    this.state = {
      avatar: user.details.avatar || defaultAvatar,
      selectedChannels: this.generateChannelsParams(props.selectedChannels),
      selectedGroups: this.generateGroupsParams(props.selectedGroups)
    };
  }

  onAvatarUpload = url => {
    this.setState({ avatar: url });
  };

  generateChannelsParams = channels => {
    return channels.map(channel => ({
      value: channel._id,
      label: channel.name
    }));
  };

  generateGroupsParams = groups => {
    return groups.map(group => ({
      value: group._id,
      label: group.name
    }));
  };

  collectValues = items => {
    return items.map(item => item.value);
  };

  renderGroups() {
    const self = this;
    const { groups } = this.props;

    const onChange = selectedGroups => {
      this.setState({ selectedGroups });
    };

    return (
      <FormGroup>
        <ControlLabel>Choose the user groups</ControlLabel>
        <br />

        <Select
          placeholder={__('Choose groups')}
          value={self.state.selectedGroups}
          options={self.generateGroupsParams(groups)}
          onChange={onChange}
          multi={true}
        />
      </FormGroup>
    );
  }

  renderChannels() {
    const self = this;
    const { channels } = this.props;

    const onChange = selectedChannels => {
      self.setState({ selectedChannels });
    };

    return (
      <FormGroup>
        <ControlLabel>Choose the channels</ControlLabel>
        <br />

        <Select
          placeholder={__('Choose channels')}
          value={self.state.selectedChannels}
          options={self.generateChannelsParams(channels)}
          onChange={onChange}
          multi={true}
        />
      </FormGroup>
    );
  }

  generateDoc = (values: {} & IUser & IUserDetails & IUserLinks) => {
    const { object } = this.props;
    const { selectedChannels, selectedGroups } = this.state;
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      _id: finalValues._id,
      username: finalValues.username,
      email: finalValues.email,
      details: {
        avatar: this.state.avatar,
        shortName: finalValues.shortName,
        fullName: finalValues.fullName,
        position: finalValues.position,
        location: finalValues.location,
        description: finalValues.description
      },
      channelIds: this.collectValues(selectedChannels),
      links: {
        linkedIn: finalValues.linkedIn,
        twitter: finalValues.twitter,
        facebook: finalValues.facebook,
        youtube: finalValues.youtube,
        github: finalValues.github,
        website: finalValues.website
      },
      groupIds: this.collectValues(selectedGroups)
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { object } = this.props;
    const user = object || { details: {} };

    return (
      <div>
        <UserCommonInfos
          user={user}
          onAvatarUpload={this.onAvatarUpload}
          formProps={formProps}
        />
        <ColumnTitle>{__('Other')}</ColumnTitle>

        {this.renderChannels()}
        {this.renderGroups()}
      </div>
    );
  };

  render() {
    return (
      <CommonForm
        {...this.props}
        name="team member"
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
        renderButton={this.props.renderButton}
        object={this.props.object}
      />
    );
  }
}

export default UserForm;
