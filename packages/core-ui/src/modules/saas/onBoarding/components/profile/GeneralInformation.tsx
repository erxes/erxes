import React from "react";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormLabel from "@erxes/ui/src/components/form/Label";
import FormGroup from "@erxes/ui/src/components/form/Group";
import {
  GeneralInformationWrapper,
  GeneralInformationForm,
  ErxesStaffProfile,
} from "modules/saas/onBoarding/styles";
import { IUser } from "@erxes/ui/src/auth/types";
import { readFile } from "modules/common/utils";

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
      return "/images/avatar-colored.svg";
    }

    return readFile(avatarUrl);
  };

  return (
    <GeneralInformationWrapper>
      <GeneralInformationForm>
        <ErxesStaffProfile state={true}>
          <div className="avatar-profile">
            <img src={getUserAvatar(avatar)} alt={firstName || ""} />
          </div>
        </ErxesStaffProfile>

        <FormGroup>
          <FormLabel uppercase={false}>First Name</FormLabel>
          <FormControl value={firstName} name="firstName" />
        </FormGroup>

        <FormGroup>
          <FormLabel uppercase={false}>Last Name</FormLabel>
          <FormControl value={lastName} name="lastName" />
        </FormGroup>

        <FormGroup>
          <FormLabel uppercase={false}>Email</FormLabel>
          <FormControl value={email} name="name" />
        </FormGroup>
      </GeneralInformationForm>
    </GeneralInformationWrapper>
  );
}

export default GeneralInformation;
