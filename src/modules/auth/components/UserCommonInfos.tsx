import {
  AvatarUpload,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import {
  ColumnTitle,
  FormColumn,
  FormWrapper
} from 'modules/common/styles/main';
import { IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { timezones } from 'modules/settings/integrations/constants';
import * as React from 'react';
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
                id="fullName"
                name="fullName"
                defaultValue={details.fullName || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Short name</ControlLabel>
              <FormControl
                type="text"
                id="shortName"
                name="shortName"
                defaultValue={details.shortName || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>Email</ControlLabel>
              <FormControl
                type="email"
                id="email"
                name="email"
                defaultValue={user.email}
                {...formProps}
                required={true}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                type="text"
                id="description"
                name="description"
                max={250}
                componentClass="textarea"
                defaultValue={details.description || ''}
                {...formProps}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Username</ControlLabel>
              <FormControl
                type="text"
                id="username"
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
                id="position"
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
                id="user-location"
                name="user-location"
                options={timezones}
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
                type="text"
                id="linkedin"
                name="linkedin"
                defaultValue={links.linkedIn || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Twitter</ControlLabel>
              <FormControl
                type="text"
                id="twitter"
                name="twitter"
                defaultValue={links.twitter || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Facebook</ControlLabel>
              <FormControl
                type="text"
                id="facebook"
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
                type="text"
                id="youtube"
                name="youtube"
                defaultValue={links.youtube || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Github</ControlLabel>
              <FormControl
                type="text"
                id="github"
                name="github"
                defaultValue={links.github || ''}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Website</ControlLabel>
              <FormControl
                type="text"
                id="website"
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
