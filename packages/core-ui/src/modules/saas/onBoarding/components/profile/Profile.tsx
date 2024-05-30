import {
  AvatarWrapper,
  ButtonContainer,
  SidebarContent,
} from "modules/saas/onBoarding/styles";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AvatarUpload from "@erxes/ui/src/components/AvatarUpload";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormLabel from "@erxes/ui/src/components/form/Label";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Button from "modules/common/components/Button";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "modules/common/components/Icon";
import { router } from "modules/common/utils";

type Props = {
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
  const navigate = useNavigate();
  const location = useLocation();

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
    router.setParams(navigate, location, { steps: 0 });
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

        <FormGroup
          className={`form-group ${activeFirst ? "active" : ""}`}
          controlId="firstName"
        >
          <FormLabel uppercase={false}>First Name</FormLabel>
          <FormControl
            defaultValue={firstName}
            name="firstName"
            onFocus={() => setActiveFirst(true)}
            onBlur={() => !firstName && setActiveFirst(false)}
            onChange={(e) => setFirstName((e.target as HTMLInputElement).value)}
          />
        </FormGroup>

        <FormGroup
          className={`form-group ${activeLast ? "active" : ""}`}
          controlId="lastName"
        >
          <FormLabel uppercase={false}>Last Name</FormLabel>
          <FormControl
            defaultValue={lastName}
            name="lastName"
            onFocus={() => setActiveLast(true)}
            onBlur={() => !lastName && setActiveLast(false)}
            onChange={(e) => setLastName((e.target as HTMLInputElement).value)}
          />
        </FormGroup>

        <FormGroup
          className={`form-group disabled ${activeEmail ? "active" : ""}`}
          controlId="email"
        >
          <FormLabel uppercase={false}>Email</FormLabel>
          <FormControl
            defaultValue={email}
            name="name"
            onFocus={() => setActiveLastEmail(true)}
            onBlur={() => !email && setActiveLastEmail(false)}
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
            disabled={true}
          />
        </FormGroup>
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
