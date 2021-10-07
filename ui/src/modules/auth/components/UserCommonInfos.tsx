import AvatarUpload from 'modules/common/components/AvatarUpload';
import CollapseContent from 'modules/common/components/CollapseContent';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import timezones from 'modules/common/constants/timezones';
import { FormColumn, FormWrapper } from 'modules/common/styles/main';
import { IFormProps } from 'modules/common/types';
import { __, getConstantFromStore } from 'modules/common/utils';
import React from 'react';
import dayjs from 'dayjs';
import { IUser } from '../types';

type Props = {
  user: IUser;
  onAvatarUpload: (url: string) => void;
  formProps?: IFormProps;
};

class UserCommonInfos extends React.PureComponent<Props> {
  renderLink(link) {
    const { user, formProps } = this.props;
    const links = user.links || {};

    return (
      <FormGroup key={link.value}>
        <ControlLabel>{link.label}</ControlLabel>
        <FormControl
          type="url"
          name={link.value}
          defaultValue={links[link.value] || ''}
          {...formProps}
        />
      </FormGroup>
    );
  }

  render() {
    const { user, onAvatarUpload, formProps } = this.props;
    const details = user.details || {};

    return (
      <>
        <CollapseContent
          title={__('General Information')}
          open={true}
          compact={true}
        >
          <AvatarUpload
            avatar={details.avatar}
            onAvatarUpload={onAvatarUpload}
          />
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
                <ControlLabel>Birthdate</ControlLabel>
                <FormControl
                  type="date"
                  name="birthDate"
                  defaultValue={dayjs(details.birthDate || new Date()).format(
                    'YYYY-MM-DD'
                  )}
                  {...formProps}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Position</ControlLabel>
                <FormControl
                  type="text"
                  name="position"
                  defaultValue={details.position}
                  {...formProps}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Join date</ControlLabel>
                <FormControl
                  type="date"
                  name="workStartedDate"
                  defaultValue={dayjs(
                    details.workStartedDate || new Date()
                  ).format('YYYY-MM-DD')}
                  {...formProps}
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
            </FormColumn>
          </FormWrapper>
        </CollapseContent>

        <CollapseContent title={__('Links')} compact={true}>
          <FormWrapper>
            <FormColumn>
              {getConstantFromStore('social_links').map(link =>
                this.renderLink(link)
              )}
            </FormColumn>
          </FormWrapper>
        </CollapseContent>
      </>
    );
  }
}

export default UserCommonInfos;
