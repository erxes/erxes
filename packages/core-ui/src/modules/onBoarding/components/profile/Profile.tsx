import React, { useState } from 'react';
import Icon from 'modules/common/components/Icon';
import Form from 'react-bootstrap/Form';
import Button from 'modules/common/components/Button';
import {
  ButtonContainer,
  SidebarContent,
  AvatarWrapper,
} from 'modules/onBoarding/styles';
import { IUser } from '@erxes/ui/src/auth/types';
import AvatarUpload from '@erxes/ui/src/components/AvatarUpload';
import { router } from 'modules/common/utils';

type Props = {
  history: any;
  userEdit: (_id: string, doc: any) => void;
  currentUser: IUser;
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  email: string;
  setEmail: (name: string) => void;
  avatar: string;
  setAvatar: (name: string) => void;
};

function Profile(props: Props) {
  const {
    history,
    userEdit,
    currentUser,
    firstName,
    lastName,
    email,
    setFirstName,
    setLastName,
    setEmail,
    avatar,
    setAvatar,
  } = props;

  const [activeFirst, setActiveFirst] = useState(firstName ? true : false);
  const [activeLast, setActiveLast] = useState(lastName ? true : false);
  const [activeEmail, setActiveLastEmail] = useState(email ? true : false);

  const onSubmit = () => {
    const details = {
      firstName,
      lastName,
      avatar,
    };

    const doc = {
      email,
      details,
    };

    return userEdit(currentUser._id, doc);
  };

  const onChangeStep = () => {
    router.setParams(history, { steps: 0 });
  };

  const onAvatarUpload = (url) => {
    setAvatar(url);
  };

  return (
    <>
      <SidebarContent>
        <AvatarWrapper>
          <AvatarUpload avatar={avatar} onAvatarUpload={onAvatarUpload} />
        </AvatarWrapper>

        <Form.Group
          className={activeFirst ? 'active' : ''}
          controlId="firstName"
        >
          <Form.Label>First Name</Form.Label>
          <Form.Control
            defaultValue={firstName}
            name="firstName"
            onFocus={() => setActiveFirst(true)}
            onBlur={() => !firstName && setActiveFirst(false)}
            onChange={(e) => setFirstName((e.target as HTMLInputElement).value)}
          />
        </Form.Group>

        <Form.Group className={activeLast ? 'active' : ''} controlId="lastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            defaultValue={lastName}
            name="lastName"
            onFocus={() => setActiveLast(true)}
            onBlur={() => !lastName && setActiveLast(false)}
            onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
          />
        </Form.Group>

        <Form.Group
          className={`disabled ${activeEmail ? 'active' : ''}`}
          controlId="email"
        >
          <Form.Label>Email</Form.Label>
          <Form.Control
            defaultValue={email}
            name="name"
            onFocus={() => setActiveLastEmail(true)}
            onBlur={() => !email && setActiveLastEmail(false)}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            disabled={true}
          />
        </Form.Group>
      </SidebarContent>

      <ButtonContainer>
        <Button btnStyle="simple" onClick={onChangeStep} block={true}>
          <Icon icon="leftarrow" size={12} /> &nbsp; Back
        </Button>
        <Button onClick={onSubmit} block={true}>
          Next &nbsp; <Icon icon="rightarrow" size={12} />
        </Button>
      </ButtonContainer>
    </>
  );
}

export default Profile;
