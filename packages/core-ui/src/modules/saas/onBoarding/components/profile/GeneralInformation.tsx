import React from 'react';
import Form from 'react-bootstrap/Form';
import {
  GeneralInformationWrapper,
  GeneralInformationForm,
  ErxesStaffProfile,
} from 'modules/saas/onBoarding/styles';
import { IUser } from '@erxes/ui/src/auth/types';
import { readFile } from 'modules/common/utils';

type Props = {
  currentUser?: IUser;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
};

function GeneralInformation(props: Props) {
  const { firstName, lastName, email, avatar } = props;

  const getUserAvatar = (avatarUrl) => {
    if (!avatar) {
      return '/images/avatar-colored.svg';
    }

    return readFile(avatarUrl);
  };

  return (
    <GeneralInformationWrapper>
      <GeneralInformationForm>
        <ErxesStaffProfile state={true}>
          <div className="avatar-profile">
            <img src={getUserAvatar(avatar)} alt={firstName || ''} />
          </div>
        </ErxesStaffProfile>

        <Form.Group controlId="firstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control value={firstName} name="firstName" />
        </Form.Group>

        <Form.Group controlId="lastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control value={lastName} name="lastName" />
        </Form.Group>

        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control value={email} name="name" />
        </Form.Group>
      </GeneralInformationForm>
    </GeneralInformationWrapper>
  );
}

export default GeneralInformation;
