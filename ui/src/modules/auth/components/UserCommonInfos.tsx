import AvatarUpload from 'modules/common/components/AvatarUpload';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import timezones from 'modules/common/constants/timezones';
import {
  ColumnTitle,
  FormColumn,
  FormWrapper
} from 'modules/common/styles/main';
import { IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IUser } from '../types';

type Props = {
  user: IUser;
  onAvatarUpload: (url: string) => void;
  formProps?: IFormProps;
};

class UserCommonInfos extends React.PureComponent<Props> {
  render() {
    const { user, onAvatarUpload, formProps } = this.props;
    const details = user.details || {};
    const links = user.links || {};

    return (
      <React.Fragment>
        <AvatarUpload avatar={details.avatar} onAvatarUpload={onAvatarUpload} />
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Full name</ControlLabel>
              <FormControl
                type="text"
                name="fullName"
                defaultValue={details.fullName || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Short name</ControlLabel>
              <FormControl
                type="text"
                name="shortName"
                defaultValue={details.shortName || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>Email</ControlLabel>
              <FormControl
                type="email"
                name="email"
                defaultValue={user.email}
                {...formProps}
                required={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Phone (operator)</ControlLabel>
              <FormControl
                type="text"
                name="operatorPhone"
                defaultValue={details.operatorPhone || ''}
                {...formProps}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Username</ControlLabel>
              <FormControl
                type="text"
                name="username"
                defaultValue={user.username}
                required={true}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Position</ControlLabel>
              <FormControl
                type="text"
                name="position"
                defaultValue={details.position || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Location</ControlLabel>
              <FormControl
                componentClass="select"
                defaultValue={details.location}
                name="location"
                options={timezones}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                type="text"
                name="description"
                max={250}
                componentClass="textarea"
                defaultValue={details.description || ''}
                {...formProps}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <ColumnTitle>{__('Links')}</ColumnTitle>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>LinkedIn</ControlLabel>
              <FormControl
                type="url"
                name="linkedIn"
                defaultValue={links.linkedIn || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Twitter</ControlLabel>
              <FormControl
                type="url"
                name="twitter"
                defaultValue={links.twitter || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Facebook</ControlLabel>
              <FormControl
                type="url"
                name="facebook"
                defaultValue={links.facebook || ''}
                {...formProps}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Youtube</ControlLabel>
              <FormControl
                type="url"
                name="youtube"
                defaultValue={links.youtube || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Github</ControlLabel>
              <FormControl
                type="url"
                name="github"
                defaultValue={links.github || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Website</ControlLabel>
              <FormControl
                type="url"
                name="website"
                defaultValue={links.website || ''}
                {...formProps}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      </React.Fragment>
    );
  }
}

export default UserCommonInfos;
