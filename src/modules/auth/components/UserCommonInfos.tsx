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
};

class UserCommonInfos extends React.Component<Props> {
  render() {
    const { user, onAvatarUpload } = this.props;

    const details = user.details || {};
    const links = user.links || {};

    return (
      <React.Fragment>
        <AvatarUpload avatar={details.avatar} onAvatarUpload={onAvatarUpload} />
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                type="text"
                id="fullName"
                defaultValue={details.fullName || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Email</ControlLabel>
              <FormControl type="text" id="email" defaultValue={user.email} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                type="text"
                id="description"
                componentClass="textarea"
                defaultValue={details.description || ''}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Username</ControlLabel>
              <FormControl
                type="text"
                id="username"
                defaultValue={user.username}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Position</ControlLabel>
              <FormControl
                type="text"
                id="position"
                defaultValue={details.position || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Location</ControlLabel>
              <FormControl
                componentClass="select"
                defaultValue={details.location}
                id="user-location"
                options={timezones}
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
                defaultValue={links.linkedIn || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Twitter</ControlLabel>
              <FormControl
                type="text"
                id="twitter"
                defaultValue={links.twitter || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Facebook</ControlLabel>
              <FormControl
                type="text"
                id="facebook"
                defaultValue={links.facebook || ''}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Youtube</ControlLabel>
              <FormControl
                type="text"
                id="youtube"
                defaultValue={links.youtube || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Github</ControlLabel>
              <FormControl
                type="text"
                id="github"
                defaultValue={links.github || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Website</ControlLabel>
              <FormControl
                type="text"
                id="website"
                defaultValue={links.website || ''}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      </React.Fragment>
    );
  }
}

export default UserCommonInfos;
