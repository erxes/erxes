import { FormColumn, FormWrapper } from "@erxes/ui/src/styles/main";
import { __, getConstantFromStore } from "@erxes/ui/src/utils";

import AvatarUpload from "@erxes/ui/src/components/AvatarUpload";
import CollapseContent from "@erxes/ui/src/components/CollapseContent";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IFormProps } from "@erxes/ui/src/types";
import { IUser } from "@erxes/ui/src/auth/types";
import React, { useState } from "react";
import SelectPositions from "@erxes/ui/src/team/containers/SelectPositions";
import dayjs from "dayjs";
import { router } from "@erxes/ui/src";
import timezones from "@erxes/ui/src/constants/timezones";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  user: IUser;
  onAvatarUpload: (url: string) => void;
  formProps?: IFormProps;
};

const UserCommonInfos = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [positionIds, setPositionIds] = useState<string[]>(
    props.user?.positionIds || []
  );

  const renderLink = (link) => {
    const { user, formProps } = props;
    const links = user.links || {};

    return (
      <FormGroup key={link.value}>
        <ControlLabel>{link.label}</ControlLabel>
        <FormControl
          type="url"
          name={link.value}
          defaultValue={links[link.value] || ""}
          {...formProps}
        />
      </FormGroup>
    );
  };

  const { user, onAvatarUpload, formProps } = props;
  console.log(user, "init");
  const details = user.details || {};

  const handlePositionChange = (val) => {
    setPositionIds(val);
    router.setParams(navigate, location, { positionIds: val });
  };

  return (
    <>
      <CollapseContent
        title={__("General Information")}
        open={true}
        compact={true}
      >
        <AvatarUpload avatar={details.avatar} onAvatarUpload={onAvatarUpload} />
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>First name</ControlLabel>
              <FormControl
                type="text"
                name="firstName"
                defaultValue={details.firstName || ""}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Last name</ControlLabel>
              <FormControl
                type="text"
                name="lastName"
                defaultValue={details.lastName || ""}
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
                componentclass="textarea"
                defaultValue={details.description || ""}
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
              <ControlLabel>Positions</ControlLabel>
              <br />

              <SelectPositions
                initialValue={positionIds}
                label={`Choose positions`}
                name="positionIds"
                onSelect={(value) => handlePositionChange(value)}
                filterParams={{ withoutUserFilter: true }}
                showAvatar={false}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Join date</ControlLabel>
              <FormControl
                type="date"
                name="workStartedDate"
                defaultValue={dayjs(
                  details.workStartedDate || new Date()
                ).format("YYYY-MM-DD")}
                {...formProps}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Middle name</ControlLabel>
              <FormControl
                type="text"
                name="middleName"
                defaultValue={details.middleName || ""}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Short name</ControlLabel>
              <FormControl
                type="text"
                name="shortName"
                defaultValue={details.shortName || ""}
                {...formProps}
              />
            </FormGroup>
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
              <ControlLabel>Employee Id</ControlLabel>
              <FormControl
                type="number"
                min={0}
                name="employeeId"
                defaultValue={user.employeeId}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Birthdate</ControlLabel>
              <FormControl
                type="date"
                name="birthDate"
                defaultValue={dayjs(details.birthDate || new Date()).format(
                  "YYYY-MM-DD"
                )}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Phone (operator)</ControlLabel>
              <FormControl
                type="text"
                name="operatorPhone"
                defaultValue={details.operatorPhone || ""}
                {...formProps}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Location</ControlLabel>
              <FormControl
                componentclass="select"
                defaultValue={details.location}
                name="location"
                options={timezones}
                {...formProps}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      </CollapseContent>

      <CollapseContent title={__("Links")} compact={true}>
        <FormWrapper>
          <FormColumn>
            {getConstantFromStore("social_links").map((link) =>
              renderLink(link)
            )}
          </FormColumn>
        </FormWrapper>
      </CollapseContent>
    </>
  );
};

export default UserCommonInfos;
