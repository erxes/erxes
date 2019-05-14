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
import { __ } from 'modules/common/utils';
import { timezones } from 'modules/settings/integrations/constants';
import * as React from 'react';
import { IUser } from '../types';

type Props = {
  user: IUser;
  onAvatarUpload: (url: string) => void;
  errors?: any[];
  registerChild?: (child: any) => void;
};

class UserCommonInfos extends React.PureComponent<Props> {
  render() {
    const { user, onAvatarUpload, errors, registerChild } = this.props;
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
                errors={errors}
                registerChild={registerChild}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Short name</ControlLabel>
              <FormControl
                type="text"
                id="shortName"
                name="shortName"
                defaultValue={details.shortName || ''}
                errors={errors}
                registerChild={registerChild}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>Email</ControlLabel>
              <FormControl
                type="email"
                id="email"
                name="email"
                defaultValue={user.email}
                errors={errors}
                registerChild={registerChild}
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
                errors={errors}
                registerChild={registerChild}
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
                errors={errors}
                registerChild={registerChild}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Position</ControlLabel>
              <FormControl
                type="text"
                id="position"
                name="position"
                defaultValue={details.position || ''}
                errors={errors}
                registerChild={registerChild}
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
                errors={errors}
                registerChild={registerChild}
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
                id="linkedin"
                name="linkedin"
                defaultValue={links.linkedIn || ''}
                errors={errors}
                registerChild={registerChild}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Twitter</ControlLabel>
              <FormControl
                type="url"
                id="twitter"
                name="twitter"
                defaultValue={links.twitter || ''}
                errors={errors}
                registerChild={registerChild}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Facebook</ControlLabel>
              <FormControl
                type="url"
                id="facebook"
                name="facebook"
                defaultValue={links.facebook || ''}
                errors={errors}
                registerChild={registerChild}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Youtube</ControlLabel>
              <FormControl
                type="url"
                id="youtube"
                name="youtube"
                defaultValue={links.youtube || ''}
                errors={errors}
                registerChild={registerChild}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Github</ControlLabel>
              <FormControl
                type="url"
                id="github"
                name="github"
                defaultValue={links.github || ''}
                errors={errors}
                registerChild={registerChild}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Website</ControlLabel>
              <FormControl
                type="url"
                id="website"
                name="website"
                defaultValue={links.website || ''}
                errors={errors}
                registerChild={registerChild}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      </React.Fragment>
    );
  }
}

export default UserCommonInfos;
