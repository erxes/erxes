import { FormControl, FormGroup } from "@erxes/ui/src/components/form";
import { IButtonMutateProps, IFormProps, IAttachment } from "@erxes/ui/src/types";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import ContactInfoForm from "../common/ContactInfoForm";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Form from "@erxes/ui/src/components/form/Form";
import { IBranch } from "@erxes/ui/src/team/types";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import { __, extractAttachment } from "modules/common/utils";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  item?: IBranch;
  closeModal: () => void;
};

export default function BranchForm(props: Props) {
  const { closeModal, renderButton, item } = props;
  const object = item || ({} as IBranch);

  const [userIds, setUserIds] = useState(
    (object.users || []).map((user) => user._id),
  );
  const [parentId, setParentId] = useState(object?.parentId);
  const [links, setLinks] = useState(object.links || {});
  const [image, setImage] = useState<IAttachment | null>(object.image && extractAttachment([object.image])[0] || null);
  const [supervisorId, setSupervisorId] = useState(object.supervisorId);

  const coordinateObj = object.coordinate || {};

  const [coordinate, setCoordinate] = useState({
    longitude: coordinateObj.longitude || "",
    latitude: coordinateObj.latitude || "",
  });

  const generateDoc = (values) => {
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      userIds,
      parentId,
      links,
      coordinate,
      supervisorId,
      image,
      ...finalValues,
      radius: Number(finalValues.radius),
    };
  };

  const onChangeParent = (value: any) => {
    setParentId(value);
  };

  const onSelectTeamMembers = (ids: any) => {
    setUserIds(ids);
  };

  const onSelectSupervisor = (value) => {
    setSupervisorId(value);
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__("Title")}</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            autoFocus={true}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Address")}</ControlLabel>
          <FormControl
            {...formProps}
            required={true}
            name="address"
            defaultValue={object.address}
            componentclass="textarea"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Code")}</ControlLabel>
          <FormControl
            {...formProps}
            required={true}
            name="code"
            defaultValue={object.code}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("Supervisor")}</ControlLabel>

          <SelectTeamMembers
            label="Choose supervisor"
            name="supervisorId"
            initialValue={supervisorId}
            onSelect={onSelectSupervisor}
            multi={false}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__("Parent")}</ControlLabel>
          <SelectBranches
            label="Branch"
            name="parentId"
            multi={false}
            initialValue={parentId || undefined}
            onSelect={onChangeParent}
            filterParams={{ withoutUserFilter: true }}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("Team Members")}</ControlLabel>

          <SelectTeamMembers
            label="Choose team members"
            name="userIds"
            initialValue={userIds}
            onSelect={onSelectTeamMembers}
          />
        </FormGroup>

        <ContactInfoForm
          object={object}
          formProps={formProps}
          setLinks={setLinks}
          links={links}
          setCoordinate={setCoordinate}
          coordinate={coordinate}
          setImage={setImage}
          image={image}
        />
        <FormGroup>
          <ControlLabel>{__("Radius")}</ControlLabel>
          <FormControl
            {...formProps}
            name="radius"
            defaultValue={object.radius}
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: values.title,
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
