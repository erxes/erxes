import UserCommonInfos from 'modules/auth/components/UserCommonInfos';
import { IUser, IUserDetails, IUserLinks } from 'modules/auth/types';
import CollapseContent from 'modules/common/components/CollapseContent';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, getConstantFromStore } from 'modules/common/utils';
import SelectBrands from 'modules/settings/brands/containers/SelectBrands';
import { IUserGroup } from 'modules/settings/permissions/types';
import React from 'react';
import Select from 'react-select-plus';
import { IChannel } from '../../channels/types';
import CommonForm from '../../common/components/Form';
import { ICommonFormProps } from '../../common/types';

type Props = {
  channels: IChannel[];
  groups: IUserGroup[];
  selectedChannels: IChannel[];
  selectedGroups: IUserGroup[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  showBrands: boolean;
} & ICommonFormProps;

type State = {
  avatar: string;
  selectedChannels: IChannel[];
  selectedGroups: IUserGroup[];
  selectedBrands: string[];
};

class UserForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const user = props.object || { details: {} };
    const defaultAvatar = '/images/avatar-colored.svg';

    this.state = {
      avatar:
        user.details && user.details.avatar
          ? user.details.avatar
          : defaultAvatar,
      selectedChannels: this.generateParams(props.selectedChannels),
      selectedGroups: this.generateParams(props.selectedGroups),
      selectedBrands: user.brandIds || []
    };
  }

  onAvatarUpload = url => {
    this.setState({ avatar: url });
  };

  generateParams = options => {
    return options.map(option => ({
      value: option._id,
      label: option.name
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
          options={self.generateParams(groups)}
          onChange={onChange}
          multi={true}
        />
      </FormGroup>
    );
  }

  renderBrands() {
    const self = this;
    const { showBrands } = this.props;

    if (!showBrands) {
      return null;
    }

    const onChange = selectedBrands => {
      this.setState({ selectedBrands });
    };

    return (
      <FormGroup>
        <ControlLabel>Choose the brands</ControlLabel>
        <br />

        <SelectBrands
          label="Brand"
          initialValue={self.state.selectedBrands}
          onSelect={onChange}
          name="selectedBrands"
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
          options={self.generateParams(channels)}
          onChange={onChange}
          multi={true}
        />
      </FormGroup>
    );
  }

  generateDoc = (values: {} & IUser & IUserDetails & IUserLinks) => {
    const { object } = this.props;
    const { selectedChannels, selectedGroups, selectedBrands } = this.state;
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    const links = {};

    getConstantFromStore('social_links').forEach(link => {
      links[link.value] = finalValues[link.value];
    });

    return {
      _id: finalValues._id,
      username: finalValues.username,
      email: finalValues.email,
      details: {
        avatar: this.state.avatar,
        shortName: finalValues.shortName,
        fullName: finalValues.fullName,
        birthDate: finalValues.birthDate,
        position: finalValues.position,
        workStartedDate: finalValues.workStartedDate,
        location: finalValues.location,
        description: finalValues.description,
        operatorPhone: finalValues.operatorPhone
      },
      channelIds: this.collectValues(selectedChannels),
      links,
      groupIds: this.collectValues(selectedGroups),
      brandIds: selectedBrands
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

        <CollapseContent title={__('Other')} compact={true}>
          {this.renderChannels()}
          {this.renderGroups()}
          {this.renderBrands()}
        </CollapseContent>
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
